var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var log_mod = require("../modules/log_mod");

var global_vars;

async function set_role_permissions(vu, role_id, permissions_ids) {
    
    for (let permission_id of permissions_ids) {
        
        // check if the relationships exists
        let exists = false;
        await global_vars.knex('roles_permissions_relations')
            .where('vendor_id', '=', vu.vendor.id)
            .where('role_id', '=', role_id)
            .where('permission_id', '=', permission_id).select('*').then((rows) => {
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
                permission_id: permission_id,
                role_id: role_id,
                vendor_id: vu.vendor.id
            }
            await global_vars.knex('roles_permissions_relations').insert(insert_data).then((result) => {
                // console.log("roles_permissions_relations inserted");
            });


        }

    }

    // now let's delete the deleted ones
    await global_vars.knex('roles_permissions_relations')
        .where('vendor_id', '=', vu.vendor.id)
        .where('role_id', '=', role_id)
        .whereNotIn('permission_id', permissions_ids)
        .delete();

}

/**
 * @api {post} /vendor/roles/create Create a role
 * @apiName VendorGroupsCreate
 * @apiGroup vendor
 * @apiDescription Create a role
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} name Group name
 * @apiParam {Integer} permissions_ids An array of the IDs of the permissions to attach to the role
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/roles/create', async function (req, res, next) {

    let success = false;
    let go_ahead = true;
    let return_data = {};

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin
    if (vu.role == 'admin') {

        // that's awesome!, we can proceed with the process of creating an account for a new role as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the role in the database, then, you will be updated by another comment
        let insert_data = {
            vendor_id: vu.vendor.id,
            name: req.body.name
        };

        let role_id = 0;
        await global_vars.knex('roles').insert(insert_data).then((result) => {

            success = true;
            // console.log("the result of role creation");
            // console.log(result);
            role_id = result[0];

        }).catch((err) => {
            go_ahead = false;
        });

        if (go_ahead) {
            // cool, now let's assign the permissions
            await set_role_permissions(vu, role_id, req.body.permissions_ids);
        }

        if(success) {
            let log_params = {
                table_name: 'roles',
                row_id: role_id,
                vu_id: vu.id,
                new_value: insert_data,
                type: 'create'
            };

            log_mod.log(log_params);
        }

        return_data['role'] = await format_mod.get_role(role_id);

    } else {

        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /vendor/roles/edit Edit a role
 * @apiName VendorGroupsEdit
 * @apiGroup vendor
 * @apiDescription Edit a role
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} role_id Group ID
 * @apiParam {String} name Group name
 * @apiParam {Integer} permissions_ids An array of the IDs of the permissions to attach to the role
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/roles/edit', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin
    if (vu.role == 'admin') {

        // that's awesome!, we can proceed with the process of creating an account for a new role as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the role in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name
        };


        let log_params = {
            table_name: 'roles',
            row_id: req.body.role_id,
            vu_id: vu.id,
            new_value: update_data,
            type: 'edit'
        };


        await log_mod.log(log_params);

        let role_id = 0;
        await global_vars.knex('roles')
            .update(update_data)
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.role_id)
            .then((result) => {
                success = true;
            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });

        if (go_ahead) {

            // cool, now let's assign the permissions
            await set_role_permissions(vu, req.body.role_id, req.body.permissions_ids);

            return_data['role'] = await format_mod.get_role(req.body.role_id, true);

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
 * @api {post} /vendor/roles/list List a role
 * @apiName VendorGroupsList
 * @apiGroup vendor
 * @apiDescription List a role
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} per_page Records per page
 * @apiParam {Integer} page Page
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/roles/list', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin
    if (vu.role == 'admin') {

        // that's awesome!, we can proceed with the process of creating an account for a new role as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the role in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name
        };

        let raw_roles = [];
        let stmnt = global_vars.knex('roles')
            .where('vendor_id', '=', vu.vendor.id)

        if (req.body.per_page != null && req.body.page != null) {
            stmnt = stmnt.paginate({
                perPage: req.body.per_page == null ? 20 : req.body.per_page,
                currentPage: req.body.page == null ? 0 : req.body.page
            });
        }

        await stmnt.then((rows) => {

            raw_roles = rows;
            success = true;

        }).catch((err) => {
            go_ahead = false;
            console.log(err);
        });

        let roles = [];
        for (let raw_role of (raw_roles.data == null ? raw_roles : raw_roles.data)) {
            roles.push(await format_mod.format_role(raw_role));
        }

        return_data['list'] = roles;
        return_data['pagination'] = raw_roles.pagination;


    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/roles/get Get a role
 * @apiName VendorGroupsGet
 * @apiGroup vendor
 * @apiDescription Get a role
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} role_id Group ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/roles/get', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin
    if (vu.role == 'admin') {

        // that's awesome!, we can proceed with the process of creating an account for a new role as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the role in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name
        };

        let record;
        await global_vars.knex('roles')
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.role_id)
            .then((rows) => {

                record = rows[0];

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });

        return_data['role'] = await format_mod.format_role(record);


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

    return router;
};
