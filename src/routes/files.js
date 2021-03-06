var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var files_mod = require("../modules/files_mod");
const AWS = require('aws-sdk');

var global_vars;

AWS.config.update({region: 'me-south-1'});
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

router.post('/files/get', async function (req, res, next) {

    // let params = {
    //     vu_token: '',
    //     guest_token: '',
    //     file_id: '',
    // };

    let go_ahead = true
    let success = false
    let errors = []
    let return_data = {}

    let user_type
    let user_id


    if (req.body.vu_token != null) {


        const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id')
        vu = await format_mod.get_vu(vu_id, true)

        user_type = 'vu'
        user_id = vu_id

    } else if (req.body.guest_token != null) {



        const guest_id = await users_mod.token_to_id('guests', req.body.guest_token, 'id')
        // const guest = await format_mod.get_guest(guest_id, true)

        user_type = 'guest'
        user_id = guest_id

    }
    if (user_id == null) {
        go_ahead = false;
    }


    let file_raw


    // get the file
    if (go_ahead) {


        await global_vars.knex('files')
            .select('*')
            .where('id', req.body.file_id)
            .then((rows) => {
                file_raw = rows[0];
            }).catch((err) => {

            })
        if (file_raw == null) {
            go_ahead = false
            errors.push('file_not_found')
        }
    }

    if (go_ahead) {
        // check permissions

        // if (file_raw.owner_type != user_type || file_raw.owner_id != user_id) {
        //     go_ahead = false
        //     errors.push("unauthroized_action")
        // }


        if (file_raw.belongs_to == 'calls') {


            let call = await global_vars.format_mod.get_call(file_raw.belongs_to_id, true, 'all')


            // loop participants
            go_ahead = false;

            for(let participant of call.participants) {
                if(user_type == 'vu' && participant.info.user_type == 'vu' && participant.info.user_id == user_id) {
                    go_ahead = true
                } else if(user_type == 'guest' && participant.info.user_type == 'guest' && participant.info.user_id == user_id) {
                    go_ahead = true
                }
            }

            // if (user_type == 'guest' && call.guest_id == user_id && call.status == 'started') {
            //     go_ahead = true
            // }
            //
            // if (user_type == 'vu' && call.vu_id == user_id) {
            //     go_ahead = true
            // }

        }
    }

    if (go_ahead) {
        success = true

        // generate signed url
        const signedUrl = s3.getSignedUrl('getObject', {
            Bucket: 'basma-uploads',
            Key: file_raw.s3_original_path.replace('https://basma-files.s3.me-south-1.amazonaws.com/', ''),
            Expires: 300
        })

        return_data['signed_url'] = signedUrl
        return_data['file_url'] = file_raw.s3_original_path
        return_data['description'] = file_raw.description
        return_data['filename'] = file_raw.filename
    }


    if (!success && errors.length > 0) {
        return_data['errors'] = errors
    }
    res.send({
        success: success,
        data: return_data
    });


});

router.post('/files/upload', async function (req, res, next) {

    let success = false
    let return_data = {}

    // let params = {
    //     vu_token: '',
    //     guest_token: '',
    //     model_name: '',
    //     record_id: '',
    //     filename: '',
    //     'file_base64': '',
    //     'belongs_to': '',
    //     'belongs_to_id': '',
    //     'belongs_to_id': '',
    //     'description': ''
    // };

    let go_ahead = false

    let vnedor
    let user_id
    let user_type

    if (req.body.vu_token != null) {

        const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id')
        const vu = await format_mod.get_vu(vu_id, true)
        vendor = await format_mod.get_vendor(vu.vendor.id, 'guest')

        user_id = vu_id
        user_type = 'vu'

        go_ahead = true

    } else if (req.body.guest_token != null) {


        const guest_id = await users_mod.token_to_id('guests', req.body.guest_token, 'id')


        const guest = await format_mod.get_guest(guest_id, true)

        vendor = guest.vendor

        user_id = guest_id
        user_type = 'guest'

        go_ahead = true
    }

    if (vendor != undefined && vendor != null) {
        go_ahead = true
    } else {
        go_ahead = false
    }

    if (go_ahead) {


        let file = await files_mod.upload(`vendor_${vendor.id}`, req.body.file_base64, req.body.filename);

        // record it into the db
        let file_id
        await global_vars.knex('files').insert({
            owner_type: user_type,
            owner_id: user_id,
            type: 'file',
            time: Date.now(),
            vendor_id: vendor.id,
            belongs_to: req.body.belongs_to,
            belongs_to_id: req.body.belongs_to_id,
            s3_original_path: file,
            description: req.body.description,
            filename: req.body.filename
        }).then((result) => {
            file_id = result[0]
            success = true
            return_data['file_id'] = file_id
        }).catch((err) => {
            console.log(err)
        })


    } else {
        res.send("unauthorized");
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
    files_mod.init(global_vars);

    return router;
};
