var express = require('express');
var router = express.Router();

var users_mod = require("../../modules/users_mod");
var format_mod = require("../../modules/format_mod");
var twilio_mod = require("../../modules/twilio_mod");
var log_mod = require("../../modules/log_mod");
var roles_mod = require("../../modules/roles_mod");

var global_vars;


async function set_group_services(vu, group_id, services_ids) {


    for (let service_id of services_ids) {


        // check if the relationships exists
        let exists = false;
        await global_vars.knex('groups_services_relations')
            .where('vendor_id', '=', vu.vendor.id)
            .where('group_id', '=', group_id)
            .where('service_id', '=', service_id).select('*').then((rows) => {
                if (rows.length > 0) {
                    exists = true;
                }
            }).then((result) => {

            }).catch((error) => {
                console.log(error);

            });


        // if doesn't exist, then add it
        if (!exists) {
            let insert_data = {
                service_id: service_id,
                group_id: group_id,
                vendor_id: vu.vendor.id
            }
            await global_vars.knex('groups_services_relations').insert(insert_data).then((result) => {
                // console.log("groups_services_relations inserted");
            });


        }

    }

    // now let's delete the deleted ones
    await global_vars.knex('groups_services_relations')
        .where('vendor_id', '=', vu.vendor.id)
        .where('group_id', '=', group_id)
        .whereNotIn('service_id', services_ids)
        .delete();

}

/**
 * @api {post} /vendor/groups/create Create a group
 * @apiName VendorGroupsCreate
 * @apiGroup vendor
 * @apiDescription Create a group
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} name Group name
 * @apiParam {Integer} services_ids An array of the IDs of the services to attach to the group
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/groups/create', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.GROUPS]);

    if (is_authenticated) {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let insert_data = {
            vendor_id: vu.vendor.id,
            name: req.body.name
        };

        let group_id = 0;
        await global_vars.knex('groups').insert(insert_data).then((result) => {

            success = true;
            // console.log("the result of group creation");
            // console.log(result);
            group_id = result[0];

        }).catch((err) => {
            go_ahead = false;
        });

        if (success) {
            // cool, now let's assign the services
            await set_group_services(vu, group_id, req.body.service_ids);
        }

        if(success) {
            let log_params = {
                table_name: 'groups',
                row_id: group_id,
                vu_id: vu.id,
                new_value: insert_data,
                type: 'create'
            };


            log_mod.log(log_params);
        }

        return_data['group'] = await format_mod.get_group(group_id);

    } else {


        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /vendor/groups/edit Edit a group
 * @apiName VendorGroupsEdit
 * @apiGroup vendor
 * @apiDescription Edit a group
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} group_id Group ID
 * @apiParam {String} name Group name
 * @apiParam {Integer} services_ids An array of the IDs of the services to attach to the group
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/groups/edit', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if can edit groups
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.GROUPS]);

    if (is_authenticated) {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name
        };


        let log_params = {
            table_name: 'groups',
            row_id: req.body.group_id,
            vu_id: vu.id,
            new_value: update_data,
            type: 'edit'
        };


        await log_mod.log(log_params);

        let group_id = 0;
        await global_vars.knex('groups')
            .update(update_data)
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.group_id)
            .then((result) => {

                success = true;

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });

        if (go_ahead) {

            // cool, now let's assign the services
            await set_group_services(vu, req.body.group_id, req.body.service_ids);

            return_data['group'] = await format_mod.get_group(req.body.group_id, true);

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
 * @api {post} /vendor/groups/list List a group
 * @apiName VendorGroupsList
 * @apiGroup vendor
 * @apiDescription List a group
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} per_page Records per page
 * @apiParam {Integer} page Page
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/groups/list', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.GROUPS]);

    if (is_authenticated) {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name
        };

        let raw_groups = [];
        let stmnt = global_vars.knex('groups')
            .where('vendor_id', '=', vu.vendor.id)

        stmnt = stmnt.where('is_deleted', '=', false);

        if (req.body.per_page != null && req.body.page != null) {
            stmnt = stmnt.paginate({
                perPage: req.body.per_page == null ? 20 : req.body.per_page,
                currentPage: req.body.page == null ? 0 : req.body.page
            });
        }


        await stmnt.then((rows) => {

            raw_groups = rows;
            success = true;

        }).catch((err) => {
            go_ahead = false;
            console.log(err);
        });

        let groups = [];
        for (let raw_group of (raw_groups.data == null ? raw_groups : raw_groups.data)) {
            groups.push(await format_mod.format_group(raw_group));
        }

        return_data['list'] = groups;
        return_data['pagination'] = raw_groups.pagination;


    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /vendor/groups/get Get a group
 * @apiName VendorGroupsGet
 * @apiGroup vendor
 * @apiDescription Get a group
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} group_id Group ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/groups/get', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.GROUPS]);

    if (is_authenticated) {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name
        };

        let record;
        await global_vars.knex('groups')
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.service_id)
            .then((rows) => {

                record = rows[0];

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });

        return_data['group'] = await format_mod.format_group(record);


    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /vendor/groups/delete Delete a group
 * @apiName VendorGroupsDelete
 * @apiGroup vendor
 * @apiDescription Delete a group
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} group_id Group ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/groups/delete', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.SERVICES]);

    if (is_authenticated) {

        let log_params = {
            table_name: 'groups',
            row_id: req.body.group_id,
            vu_id: vu.id,
            type: 'delete'
        };
        await log_mod.log(log_params);


        // delete the groups_services_relations relations
        await global_vars.knex('groups_services_relations')
            .delete()
            .where('vendor_id', '=', vu.vendor.id)
            .where('group_id', '=', req.body.group_id)
            .then(() => {

            });

        // delete the groups_services_relations relations
        await global_vars.knex('vu_groups_relations')
            .delete()
            .where('vendor_id', '=', vu.vendor.id)
            .where('group_id', '=', req.body.group_id)
            .then(() => {

            });

        await global_vars.knex('groups').update({
            'is_deleted': true
        })
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.group_id)
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
