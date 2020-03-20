var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var twilio_mod = require("../modules/twilio_mod");

var global_vars;


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

    if (vu == null && vu.role == 'admin') {
        go_ahead = false;
    }

    if (go_ahead) {
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
    }

    if (go_ahead) {
        // define the data to be inserted

        var insert_data = {
            vendor_id: vu.vendor.id,
            name: req.body.name,
            role: req.body.role,
            email: req.body.email,
            username: req.body.username,
            password: users_mod.encrypt_password(req.body.password),
            creation_time: Date.now()
        };

        // and now, do the insertion
        let record_id;
        await global_vars.knex('vendors_users').insert(insert_data).then((result) => {
            record_id = result[0];
            success = true;
        });

        return_data['user'] = await format_mod.get_vu(record_id, true);
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
 * @apiParam {String} role "admin" or "agent"
 * @apiParam {String} password new password, leave empty if you do not wish to change
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

    // check if admin
    if (vu.role == 'admin' || vu.id == req.body.vu_id) {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name,
            email: req.body.email
        };

        if (req.body.password != null && req.body.password != '') {
            update_data['password'] = users_mod.encrypt_password(req.body.password);
        }

        if (vu.role == 'admin' && req.body.role != null) {
            update_data['role'] = req.body.role;
        }

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
    var go_ahead = true;
    var return_data = {};


    // generate a token for our beloved guest
    // create a guest token

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');
    let vu = await format_mod.get_vu(vu_id);

    if (vu == null && vu.role == 'admin') {
        go_ahead = false;
    }

    if (go_ahead) {
        // check if username is taken
        let users = null;
        await global_vars.knex('vendors_users').select('*').where('vendor_id', '=', vu.vendor.id).orderBy('id', 'DESC').then((rows) => {
            users = rows;
        }).paginate({
            perPage: req.body.per_page == null ? 20 : req.body.per_page,
            currentPage: req.body.page == null ? 0 : req.body.page
        });

        let fixed_users = [];

        for (let user of users) {
            fixed_users.push(await format_mod.format_vu(user));
        }

        return_data['users'] = fixed_users;
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

    return router;
};
