var express = require('express');
var router = express.Router();

var users_mod = require("../../modules/users_mod");
var format_mod = require("../../modules/format_mod");
var twilio_mod = require("../../modules/twilio_mod");
var roles_mod = require("../../modules/roles_mod");
var files_mod = require("../../modules/files_mod");
var notifs_mod = require("../../modules/notifs_mod");
const AWS = require('aws-sdk');
var moment = require('moment');
const uuid = require('uuid');

var global_vars;

// setup s3
AWS.config.update({ region: 'me-south-1' });
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

/**
 * @api {post} /vendor/calls/list Calls list
 * @apiName VendorCallsHistory
 * @apiGroup vendor
 * @apiDescription Get the history of the calls
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} page Page number
 * @apiParam {Integer} per_page Items per page
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/calls/list', async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id);

    // get cals
    let calls = [];

    let stmnt = global_vars.knex('calls').select('*');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.SUPERUSER]);

    if (!is_authenticated) {
        stmnt = stmnt.where('vu_id', '=', vu.id);
    }

    stmnt = stmnt.orderBy('id', 'DESC');
    // stmnt = stmnt.limit(20);
    stmnt = stmnt.paginate({perPage: req.body.per_page, currentPage: req.body.page});


    await stmnt.then((rows) => {
        calls = rows;
    });


    let fixed_calls = [];
    for (let call of (calls.data == null ? calls : calls.data)) {
        fixed_calls.push(await format_mod.format_call(call, false));
    }

    return_data['list'] = fixed_calls;
    return_data['pagination'] = calls.pagination;


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/calls/get Get a call
 * @apiName VendorCallsGet
 * @apiGroup vendor
 * @apiDescription Get a call
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} call_id Call ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/calls/get', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // get the call
    let call = await format_mod.get_agent_call(req.body.call_id);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.CALLS_HISTORY], call);

    if (is_authenticated || call.vu_id == vu.id) {

        return_data['call'] = await format_mod.format_call(call, true);

        let snapshots = [];
        let snapshots_raw = [];
        await global_vars.knex('files')
            .where('belongs_to','calls')
            .where('belongs_to_id', call.id)
            .then(rows => {
                snapshots_raw = rows;
            }).catch();

        for(let snapshot_raw of snapshots_raw) {
            snapshots.push(await files_mod.formatImage(snapshot_raw));
        }

        return_data['snapshots'] = snapshots;

        let messages = [];
        let messages_raw = [];
        await global_vars.knex('messages')
            .where('call_id', call.id)
            .then(rows => {
                messages_raw = rows;
            }).catch();

        for(let message_raw of messages_raw) {
            messages.push(message_raw);
            // snapshots.push(await files_mod.formatImage(snapshot_raw));
        }

        return_data['messages'] = messages;

        // get the snapshots


        success = true;

    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/calls/get_recording Get a call's recording
 * @apiName VendorCallsGetRecording
 * @apiGroup vendor
 * @apiDescription Get a call's recording
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} call_id Call ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/calls/get_recording', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // get the call
    let call = await format_mod.get_agent_call(req.body.call_id);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.RECORDINGS]);

    if (is_authenticated || call.vu_id == vu.id) {

        // get the call manually

        let raw_call;
        await global_vars.knex('calls').where('id', '=', call.id).then((rows) => {
            raw_call = rows[0];
        });

        if(raw_call.s3_recording_folder != null && raw_call.s3_recording_folder != '') {


            const thumb_key = `calls/${raw_call.s3_recording_folder}/thumb.jpg`;
            const video_key = `calls/${raw_call.s3_recording_folder}/video.mp4`;
            const signedUrlExpireSeconds = 30

            const thumb_url = s3.getSignedUrl('getObject', {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: thumb_key,
                Expires: signedUrlExpireSeconds
            })

            const video_url = s3.getSignedUrl('getObject', {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: video_key,
                Expires: signedUrlExpireSeconds
            })

            return_data['thumb_url'] = thumb_url;
            return_data['video_url'] = video_url;


        }

        success = true;


    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});



/**
 * @api {post} /vendor/calls/schedule Schedule a Call
 * @apiName VendorCallsSchedule
 * @apiGroup vendor
 * @apiDescription Schedule a call with a customer
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} service_id Service ID
 * @apiParam {Integer} vu_id VU's ID
 * @apiParam {String} phone_number Phone number
 * @apiParam {Boolean} send_sms Send the user an SMS notification
 * @apiParam {Integer} scheduled_time The call's time, as a unix timestamp in ms (that's milliseconds)
 * @apiParam {JSON} custom_fields_value The custom fields and their values, as a json array
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 */
router.post('/vendor/calls/schedule', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');


    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.CALL_REQUESTS]);

    if (is_authenticated) {

        let request_id = 0;
        // const request_token = uuid.v1();
        const request_token = await users_mod.generate_token('call_requests');
        // const request_token = Math.random().toString(36).substring(7);


        // insert the schedule in the database
        await global_vars.knex('call_requests').insert({
            vendor_id: vu.vendor.id,
            vu_id: req.body.vu_id,
            creation_time: Date.now(),
            scheduled_time: req.body.scheduled_time,
            service_id: req.body.service_id,
            send_sms: req.body.send_sms,
            custom_fields_values: req.body.custom_fields_values == null ? null : JSON.stringify(req.body.custom_fields_values),
            token: request_token

        }).then((result) => {
            success = true;

            request_id = result;

        });

        if(success) {
            if(req.body.send_sms) {

                console.log("I AM HERE!!!");

                // phone number
                let phone_number = null;
                if(req.body.custom_fields_values != null) {

                    let phone_cs = req.body.custom_fields_values.filter((a) => {
                        return a.name == 'phone' || 'mobile' || 'phone_number' || 'mobile_number';
                    })[0];

                    if(phone_cs != null) {
                        phone_number = phone_cs.value;
                    }

                }

                global_vars.logger.debug('vendor_calls:schedule '+`phone: ${phone_number}`);
                if(phone_number != null) {
                    let time_humanized = moment(req.body.scheduled_time).format("dddd DD/MM/YYYY hh:mm A");
                    let link = `${process.env.PUBLIC_LINK}/${vu.vendor.username}?token=${request_token}`;

                     notifs_mod.sendSMS(phone_number, `Your video call with ${vu.vendor.name} is scheduled on ${time_humanized}, 
to attend your video call, follow the link: ${link}`);
                }

            }
        }




    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});




module.exports = function (options) {

    global_vars = options;
    users_mod.init(global_vars);
    format_mod.init(global_vars);
    roles_mod.init(global_vars);
    notifs_mod.init(global_vars);
    files_mod.init(global_vars);

    return router;
};
