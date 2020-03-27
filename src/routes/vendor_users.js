var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var twilio_mod = require("../modules/twilio_mod");
var log_mod = require("../modules/log_mod");
var roles_mod = require("../modules/roles_mod");

var global_vars;


async function set_vu_groups(vu, vu_id, groups_ids) {


    for (let group_id of groups_ids) {


        // check if the relationships exists
        let exists = false;
        await global_vars.knex('vu_groups_relations')
            .where('vendor_id', '=', vu.vendor.id)
            .where('vu_id', '=', vu_id)
            .where('group_id', '=', group_id).select('*').then((rows) => {
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
                vu_id: vu_id,
                group_id: group_id,
                vendor_id: vu.vendor.id
            }
            await global_vars.knex('vu_groups_relations').insert(insert_data).then((result) => {
                console.log("vu_groups_relations inserted");
            });
        }

    }

    // now let's delete the deleted ones
    await global_vars.knex('vu_groups_relations')
        .where('vendor_id', '=', vu.vendor.id)
        .where('vu_id', '=', vu_id)
        .whereNotIn('group_id', groups_ids)
        .delete();

}

async function set_vu_roles(vu, vu_id, roles_ids) {

    for (let role_id of roles_ids) {


        // check if the relationships exists
        let exists = false;
        await global_vars.knex('vu_roles_relations')
            .where('vendor_id', '=', vu.vendor.id)
            .where('vu_id', '=', vu_id)
            .where('role_id', '=', role_id).select('*').then((rows) => {
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
                vu_id: vu_id,
                role_id: role_id,
                vendor_id: vu.vendor.id
            }
            await global_vars.knex('vu_roles_relations').insert(insert_data).then((result) => {
                console.log("vu_roles_relations inserted");
            });
        }

    }

    // now let's delete the deleted ones
    await global_vars.knex('vu_roles_relations')
        .where('vendor_id', '=', vu.vendor.id)
        .where('vu_id', '=', vu_id)
        .whereNotIn('role_id', roles_ids)
        .delete();

}


/**
 * @api {post} /vendor/users/create Create a user
 * @apiName VendorCreateUser
 * @apiGroup Vendor
 * @apiDescription Create a user for a vendor (agent, manager et al.)
 *
 * @apiParam {String} vu_token The vendor token
 * @apiParam {String} name Full name
 * @apiParam {String} role "agent" or "admin"
 * @apiParam {String} username The username
 * @apiParam {String} password The password
 * @apiParam {String} [phone_status] Phone status
 * @apiParam {Array} [groups_ids] Group IDs
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/users/create', async function (req, res, next) {

    var success = false;
    var go_ahead = true;
    var return_data = {};

    // generate a token for our beloved guest
    // create a guest token

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');
    let vu = await format_mod.get_vu(vu_id);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.USERS]);

    if (is_authenticated) {

        // check if username is taken
        await global_vars.knex('vendors_users').select('*').where('vendor_id', '=', vu.vendor.id).where('username', '=', req.body.username).then((rows) => {
            if (rows.length > 0) {
                if (return_data['errors'] == null) {
                    return_data['errors'] = [];
                }
                return_data['errors'].push('username_taken');
                go_ahead = false;
            }
        });

        if (go_ahead) {
            // define the data to be inserted

            var insert_data = {
                vendor_id: vu.vendor.id,
                name: req.body.name,
                email: req.body.email,
                username: req.body.username,
                password: users_mod.encrypt_password(req.body.password),
                creation_time: Date.now(),
                phone_status: req.body.phone_status
            };

            // and now, do the insertion
            let record_id;
            await global_vars.knex('vendors_users').insert(insert_data).then((result) => {
                record_id = result[0];
                success = true;
            });

            console.log(record_id);

            if (success) {
                // cool, now let's assign the groups
                if (req.body.groups_ids != null) {
                    await set_vu_groups(vu, record_id, req.body.groups_ids);
                }

                // cool, now let's assign the roles
                if (req.body.roles_ids != null) {
                    await set_vu_roles(vu, record_id, req.body.roles_ids);
                }
            }

            if (success) {
                let log_params = {
                    table_name: 'vendors_users',
                    row_id: record_id,
                    vu_id: vu.id,
                    new_value: insert_data,
                    type: 'create'
                };
                log_mod.log(log_params);
            }

            return_data['user'] = await format_mod.get_vu(record_id, true);
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
 * @api {post} /vendor/users/edit Edit a user
 * @apiName VendorUsersEdit
 * @apiGroup vendor
 * @apiDescription Edit a users
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} vu_id Vendor User ID
 * @apiParam {String} name Name
 * @apiParam {String} [role] "admin" or "agent"
 * @apiParam {String} [password] new password, leave empty if you do not wish to change
 * @apiParam {String} [phone_status] "online" or "offline"
 * @apiParam {Array} [groups_ids] Group IDs
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/users/edit', async function (req, res, next) {

    let success = false;
    let go_ahead = true;
    let return_data = {};

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');
    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.USERS]);

    if (is_authenticated || vu.id == req.body.vu_id) {
        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name,
            email: req.body.email,
            phone_status: req.body.phone_status
        };

        if (req.body.password != null && req.body.password != '') {
            update_data['password'] = users_mod.encrypt_password(req.body.password);
        }

        let log_params = {
            table_name: 'vendors_users',
            row_id: req.body.vu_id,
            vu_id: vu.id,
            new_value: update_data,
            type: 'edit'
        };

        await log_mod.log(log_params);

        let group_id = 0;
        await global_vars.knex('vendors_users').update(update_data)
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.vu_id)
            .then((result) => {

                success = true;

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });

        if (success) {
            // cool, now let's assign the groups
            if (is_authenticated && req.body.groups_ids != null) {
                await set_vu_groups(vu, req.body.vu_id, req.body.groups_ids);
            }

            // cool, now let's assign the role
            if (is_authenticated && req.body.roles_ids != null) {
                await set_vu_roles(vu, req.body.vu_id, req.body.roles_ids);
            }

            return_data['user'] = await format_mod.get_vu(req.body.vu_id, true);
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
 * @api {post} /vendor/users/list List users
 * @apiName VendorListUsers
 * @apiGroup Vendor
 * @apiDescription List the users of the logged in vendor
 *
 * @apiParam {String} vu_token The vendor token
 * @apiParam {Integer} per_page Per page
 * @apiParam {Integer} page Page number
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/users/list', async function (req, res, next) {

    var success = true;
    var return_data = {};

    // generate a token for our beloved guest
    // create a guest token

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');
    let vu = await format_mod.get_vu(vu_id);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.USERS]);

    if (is_authenticated) {

        // check if username is taken
        let users = null;
        let stmnt = global_vars.knex('vendors_users').select('*').where('vendor_id', '=', vu.vendor.id).orderBy('id', 'DESC')

        if (req.body.per_page != null && req.body.page != null) {
            stmnt = stmnt.paginate({
                perPage: req.body.per_page == null ? 20 : req.body.per_page,
                currentPage: req.body.page == null ? 0 : req.body.page
            });
        }

        await stmnt.then((rows) => {
            users = rows;
        });

        let fixed_users = [];

        for (let user of (users.data == null ? users : users.data)) {
            fixed_users.push(await format_mod.format_vu(user, false));
        }

        return_data['list'] = fixed_users;
        return_data['pagination'] = users.pagination;

    }else{
        return_data['errors'] = ['unauthorized_action'];
    }



    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/users/get Get a user
 * @apiName VendorUsersGet
 * @apiGroup vendor
 * @apiDescription Get a user
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} vu_id Vendor User ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/users/get', async function (req, res, next) {

    let success = false;
    let return_data = {};

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');
    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.USERS]);

    if (is_authenticated || vu.id == req.body.vu_id) {
        return_data['user'] = await format_mod.get_vu(req.body.vu_id, true);
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
