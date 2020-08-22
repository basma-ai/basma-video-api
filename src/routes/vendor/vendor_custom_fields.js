var express = require('express');
var router = express.Router();

var users_mod = require("../../modules/users_mod");
var format_mod = require("../../modules/format_mod");
var twilio_mod = require("../../modules/twilio_mod");
var log_mod = require("../../modules/log_mod");
var roles_mod = require("../../modules/roles_mod");

var global_vars;


router.post('/vendor/custom_fields/create', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.CUSTOM_FIELDS]);

    if (is_authenticated) {

        // check package shall allow
        let shall_allow = await global_vars.packages_mod.check_package_limit({
            package_id: vu.vendor.package_id,
            vendor_id: vu.vendor.id,
            table_name: 'custom_fields',
            package_field: 'custom_fields'
        });

        if (!shall_allow.shall_allow) {
            return_data['errors'] = ['package_limitation'];
            return_data['package_limitation'] = shall_allow;

            go_ahead = false;
            success = false;
        }

        if (go_ahead) {


            let insert_data = {
                vendor_id: vu.vendor.id,
                name: req.body.name,
                type: req.body.type,
                label: req.body.label,
                is_mandatory: req.body.is_mandatory,
                is_visible_in_menus: req.body.is_visible_in_menus,
                tarteeb: req.body.tarteeb,
                agent_only: req.body.agent_only,
                value_description: req.body.value_description,
            };

            let record_id = 0;
            await global_vars.knex('custom_fields').insert(insert_data).then((result) => {

                success = true;

                record_id = result[0];

            }).catch((err) => {
                go_ahead = false;
            });

            if (success) {
                let log_params = {
                    table_name: 'custom_fields',
                    row_id: record_id,
                    vu_id: vu.id,
                    new_value: insert_data,
                    type: 'create'
                };


                log_mod.log(log_params);
            }

            return_data['custom_fields'] = await format_mod.get_custom_field(record_id);

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
 * @api {post} /vendor/custom_fields/edit Edit a custom fields
 * @apiName VendorCustomFieldsEdit
 * @apiGroup vendor
 * @apiDescription Edit a custom field
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} custom_field_id ID
 * @apiParam {String} type "text", "number", etc...
 * @apiParam {String} name Custom field name
 * @apiParam {String} label Custom field label
 * @apiParam {Boolean} is_mandatory Is mandatory?
 * @apiParam {Boolean} is_visible_in_menus Is visible menus?
 * @apiParam {Boolean} agent_only Agent only
 * @apiParam {Dynamic} value_description Value description
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/custom_fields/edit', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');
    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.CUSTOM_FIELDS]);

    if (is_authenticated) {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name,
            type: req.body.type,
            label: req.body.label,
            is_mandatory: req.body.is_mandatory,
            is_visible_in_menus: req.body.is_visible_in_menus,
            tarteeb: req.body.tarteeb,
            agent_only: req.body.agent_only,
            value_description: req.body.value_description
        };


        let log_params = {
            table_name: 'custom_fields',
            row_id: req.body.custom_field_id,
            vu_id: vu.id,
            new_value: update_data,
            type: 'edit'
        };
        await log_mod.log(log_params);


        let group_id = 0;
        await global_vars.knex('custom_fields').update(update_data)
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.custom_field_id)
            .where('is_deleted', '=', false)
            .then((result) => {

                success = true;

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });

        if (success) {
            return_data['custom_field'] = await format_mod.get_custom_field(req.body.custom_field_id);
            if (return_data['custom_field']['vendor_id'] != vu.vendor.id) {
                return_data['custom_field'] = null;
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
 * @api {post} /vendor/custom_fields/list List custom fields
 * @apiName VendorCustomFieldsList
 * @apiGroup vendor
 * @apiDescription List custom fields
 *
 * @apiParam {String} vu_token Vendor User Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/custom_fields/list', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};
    let raw_records = [];
    let stmnt;

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');
    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.CUSTOM_FIELDS]);

    if (is_authenticated) {
        stmnt = global_vars.knex('custom_fields')
            .where('vendor_id', '=', vu.vendor.id).orderBy('tarteeb', 'ASC');

        stmnt = stmnt.where('is_deleted', '=', false);
        if (req.body.per_page != null && req.body.page != null) {
            stmnt = stmnt.paginate({
                perPage: req.body.per_page == null ? 20 : req.body.per_page,
                currentPage: req.body.page == null ? 0 : req.body.page
            });
        }

        await stmnt.then((rows) => {

            raw_records = rows;
            success = true;

        }).catch((err) => {
            go_ahead = false;
            console.log(err);
        });

        let list = [];
        for (let raw_record of (raw_records.data == null ? raw_records : raw_records.data)) {
            list.push(await format_mod.format_custom_field(raw_record));
        }

        return_data['list'] = list;
        return_data['pagination'] = raw_records.pagination;

        // check package shall allow
        let shall_allow = await global_vars.packages_mod.check_package_limit({
            package_id: vu.vendor.package_id,
            vendor_id: vu.vendor.id,
            table_name: 'custom_fields',
            package_field: 'custom_fields'
        });

        return_data['package_limitation'] = shall_allow;


    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/custom_fields/get Get a custom field
 * @apiName VendorCustomFieldsGet
 * @apiGroup vendor
 * @apiDescription Get a custom field
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} custom_field_id ID, of the custom field
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/custom_fields/get', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.CUSTOM_FIELDS]);

    if (is_authenticated) {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name
        };

        let record;
        await global_vars.knex('custom_fields')
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.custom_field_id)
            .then((rows) => {

                record = rows[0];
                success = true;

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });

        return_data['custom_field'] = await format_mod.format_custom_field(record);


    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/custom_fields/delete Delete a custom field
 * @apiName VendorCustomFieldsDelete
 * @apiGroup vendor
 * @apiDescription Delete a custom fields
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} custom_field_id Custom Field ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/custom_fields/delete', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.CUSTOM_FIELDS]);

    if (is_authenticated) {

        let log_params = {
            table_name: 'custom_fields',
            row_id: req.body.custom_field_id,
            vu_id: vu.id,
            type: 'delete'
        };
        await log_mod.log(log_params);


        await global_vars.knex('custom_fields').update({
            'is_deleted': true
        })
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.custom_field_id)
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


module.exports = function (options) {

    global_vars = options;
    users_mod.init(global_vars);
    format_mod.init(global_vars);
    log_mod.init(global_vars);
    roles_mod.init(global_vars);

    return router;
};
