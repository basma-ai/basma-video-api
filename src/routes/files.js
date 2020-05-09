var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var files_mod = require("../modules/files_mod");

var global_vars;

router.post('/files/get', async function (req, res, next) {

    
});

router.post('/files/upload', async function (req, res, next) {

    let success = false
    let return_data = {}

    // let params = {
    //     user_type: '',
    //     user_token: '',
    //     model_name: '',
    //     record_id: '',
    //     filename: '',
    //     'file_base64': '',
    //     'belongs_to': '',
    //     'belongs_to_id': '',
    // };

    let go_ahead = false

    let vnedor
    let user_id

    if(req.body.user_type == 'vu') {

        const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.user_token, 'vu_id')
        const vu = await format_mod.get_vu(vu_id, true)
        vendor = await format_mod.get_vendor(vu.vendor.id, 'guest')

        user_id = vu_id

    } else if(req.body.user_type == 'guest') {

        const guest_id = await users_mod.token_to_id('guests', req.body.user_token, 'id')
        const guest = await format_mod.get_guest(guest_id, true)

        vendor = guest.vendor

        user_id = guest_id

    }

    if(vendor != null) {
        go_ahead = true
    }

    if(go_ahead) {

        let file = await files_mod.upload(`vendor_${vendor.id}`, req.body.file_base64, req.body.filename);

        // record it into the db
        let file_id
        await global_vars.knex('files').insert({
            owner_type: req.body.user_type,
            owner_id: user_id,
            type: 'file',
            time: Date.now(),
            vendor_id: vendor.id,
            belongs_to: req.body.belongs_to,
            belongs_to_id: req.body.belongs_to_id,
            s3_original_path: file
        }).then((result) => {
            file_id = result
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
