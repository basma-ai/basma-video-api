var express = require('express');
var router = express.Router();

var users_mod = require("../../modules/users_mod");
var format_mod = require("../../modules/format_mod");
var data_utils = require("../../modules/data_utils");
var log_mod = require("../../modules/log_mod");
var roles_mod = require("../../modules/roles_mod");

var global_vars;



/**
 * @api {post} /vendor/settings/edit Edit vendor settings
 * @apiName VendorSettingsEdit
 * @apiGroup vendor
 * @apiDescription Edit vendor's settings
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {String} [name] Vendor Name
 * @apiParam {JSON} [working_hours] Working hours, as a json object, in the given template
 * @apiParam {Boolean} [recording_enabled] Whether to enable or disable recordings
 * @apiParam {String} [call_request_sms_template] The template of the SMS message to send to the customer upon agent starting the call with them
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/settings/edit', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.SETTINGS]);

    if (is_authenticated) {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = data_utils.populate_data_obj(['name', 'working_hours', 'recording_enabled', 'call_request_sms_template', 'out_of_working_hours_message'], req.body);


        let log_params = {
            table_name: 'vendors',
            row_id: vu.vendor.id,
            vu_id: vu.id,
            new_value: update_data,
            type: 'edit'
        };
        await log_mod.log(log_params);


        let group_id = 0;
        await global_vars.knex('vendors').update(update_data)
            .where('id', '=', vu.vendor.id)
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
 * @api {post} /vendor/settings/get Get vendor's settings
 * @apiName VendorSettingsGet
 * @apiGroup vendor
 * @apiDescription Get vendor's settings
 *
 * @apiParam {String} vu_token Vendor User Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/settings/get', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');


    // check if is_authenticated
    // const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.]);

    if (vu_id != null) {
        const vu = await format_mod.get_vu(vu_id, true);


        let record;
        await global_vars.knex('vendors')
            .select('*')
            .where('id', '=', vu.vendor.id)
            .then((rows) => {

                record = rows[0];
                success = true;

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });

        return_data['vendor'] = await format_mod.format_vendor(record, 'agent');


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
    log_mod.init(global_vars);
    roles_mod.init(global_vars);
    data_utils.init(global_vars);

    return router;
};
