var express = require('express');
var router = express.Router();

var users_mod = require("../../modules/users_mod");
var format_mod = require("../../modules/format_mod");
var twilio_mod = require("../../modules/twilio_mod");
var roles_mod = require("../../modules/roles_mod");
var notifs_mod = require("../../modules/notifs_mod");
var data_utils = require("../../modules/data_utils");
var calls_mod = require("../../modules/calls_mod");
const AWS = require('aws-sdk');
var moment = require('moment');
const uuid = require('uuid');
var log_mod = require("../../modules/log_mod");

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
router.post('/vendor/call_requests/list', async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id);

    // get cals
    let calls = [];

    let stmnt = global_vars.knex('call_requests').select('*');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    // check if is_authenticated
    const has_call_requests_permission = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.CALL_REQUESTS]);

    if (!has_call_requests_permission) {
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
        fixed_calls.push(await format_mod.format_call_request(call, false));
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
router.post('/vendor/call_requests/get', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // get the call
    let call = await format_mod.get_call_request(req.body.call_request_id);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.CALL_REQUESTS], call);

    if (is_authenticated || call.vu_id == vu.id) {

        return_data['call'] = await format_mod.format_call_request(call, true);
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
 * @api {post} /vendor/call_requests/create Schedule a Call
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
 * @apiParam {JSON} custom_fields_values The custom fields and their values, as a json array
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 */
router.post('/vendor/call_requests/create', async function (req, res, next) {


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
                        return a.name == 'mobile';
                    })[0];

                    if(phone_cs != null) {
                        phone_number = phone_cs.value;
                    }

                }

                global_vars.logger.debug('vendor_calls:schedule '+`phone: ${phone_number}`);
                if(phone_number != null) {
                    let time_humanized = moment(req.body.scheduled_time).format("dddd DD/MM/YYYY hh:mm A");
                    let link = `${process.env.PUBLIC_LINK}/${vu.vendor.username}/?token=${request_token}`;

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


/**
 * @api {post} /vendor/call_requests/edit Edit a call request
 * @apiName VendorsCallsRequestsEdit
 * @apiGroup vendor
 * @apiDescription Edit a call request
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} call_request_id Call Request ID
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
router.post('/vendor/call_requests/edit', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.CALL_REQUESTS]);

    // get the request
    let call_request = format_mod.get_call_request(req.body.call_request_id);
    if (is_authenticated || vu.id == call_request.vu_id) {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment

        update_data = data_utils.populate_data_obj(['vu_id', 'scheduled_time', 'service_id', 'send_sms', 'custom_fields_values'], req.body);


        let log_params = {
            table_name: 'call_requests',
            row_id: req.body.call_request_id,
            vu_id: vu.id,
            new_value: update_data,
            type: 'edit'
        };
        await log_mod.log(log_params);


        let group_id = 0;
        await global_vars.knex('call_requests').update(update_data)
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.call_request_id)
            .then((result) => {

                success = true;

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });


    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/call_requests/join Join a call (get call ID)
 * @apiName VendorsCallsRequestsJoin
 * @apiGroup vendor
 * @apiDescription Get the ID of a call, or initiate it, also known as join
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} call_request_id Call Request ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/call_requests/join', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.CALL_REQUESTS]);

    let call_request = await format_mod.get_call_request(req.body.call_request_id);
    if (is_authenticated || vu.id == call_request.vu_id) {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment


        let call_id;
        if(call_request.call_id == null || call_request.call_id == 0) {
            call_id = await calls_mod.generate_call({
                vendor_id: vu.vendor.id,
                status: 'waiting_for_customer',
                vu_id: vu.id,
                vendor_service_id: call_request.service_id,
                custom_fields_values: JSON.stringify(call_request.custom_fields_values)
            });
        } else {
            call_id = call_request.call_id;
        }

        let update_data = {
            call_id: call_id
        };

        await global_vars.knex('call_requests').update(update_data)
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.call_request_id)
            .then((result) => {

                success = true;

                return_data['call_id'] = call_id;

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });


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
    log_mod.init(global_vars);
    calls_mod.init(global_vars);

    return router;
};
