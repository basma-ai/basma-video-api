var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var twilio_mod = require("../modules/twilio_mod");

var global_vars;


/**
 * @api {post} /vendor/dashboard_numbers Get numbers for the dashboard
 * @apiName VendorDashboardNumbers
 * @apiGroup vendor
 * @apiDescription Get the stat numbers for the homepage
 *
 * @apiParam {String} vu_token Vendor User Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/dashboard_numbers', async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id);

    // total_calls
    let total_calls = 0;

    let stmnt = global_vars.knex('calls').count('id as count');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    if (vu.role != 'admin') {
        stmnt = stmnt.where('vu_id', '=', vu.id);
    }
    await stmnt.then((result) => {
        total_calls = result[0].count;
    });
    return_data['total_calls'] = total_calls;

    // answered_calls
    let answered_calls = 0;
    stmnt = global_vars.knex('calls').count('id as count');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);
    stmnt = stmnt.where('status', '=', 'ended');

    if (vu.role != 'admin') {
        stmnt = stmnt.where('vu_id', '=', vu.id);
    }
    await stmnt.then((result) => {
        answered_calls = result[0].count;
    });

    return_data['answered_calls'] = answered_calls;

    // answered_calls
    let unanswered_calls = 0;
    stmnt = global_vars.knex('calls').count('id as count');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);
    stmnt = stmnt.where('status', '!=', 'ended');

    if (vu.role != 'admin') {
        stmnt = stmnt.where('vu_id', '!=', vu.id);
    }
    await stmnt.then((result) => {
        unanswered_calls = result[0].count;
    });

    return_data['unanswered_calls'] = unanswered_calls;

    // top services
    let top_services = [];
    stmnt = global_vars.knex('calls').select('vendor_service_id').count('vendor_service_id as value_occurrence').groupBy('vendor_service_id').orderBy('value_occurrence', 'DESC');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    if (vu.role != 'admin') {
        stmnt = stmnt.where('vu_id', '!=', vu.id);
    }


    await stmnt.then((result) => {
        top_services = result;
    });

    return_data['top_services'] = [];
    for (let service of top_services) {
        return_data['top_services'].push(await format_mod.get_vendor_service(service.vendor_service_id));
    }

    // Most active agent
    let most_active = [];
    stmnt = global_vars.knex('calls').select('vu_id').count('vu_id as value_occurrence').groupBy('vu_id').orderBy('value_occurrence', 'DESC');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    if (vu.role != 'admin') {
        stmnt = stmnt.where('vu_id', '!=', vu.id);
    }


    await stmnt.then((result) => {
        most_active = result;
    });

    return_data['most_active_agents'] = [];
    for (let vu_ma of most_active) {

        if (vu_ma.vu_id != null) {
            let vu_topush = await format_mod.get_vu(vu_ma.vu_id, false);
            vu_topush['calls_answered'] = vu_ma['value_occurrence'];
            return_data['most_active_agents'].push(vu_topush);
        }


    }

    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/calls_history Calls history
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
router.post('/vendor/calls_history', async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id);

    // get cals
    let calls = [];

    let stmnt = global_vars.knex('calls').select('*');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    if (vu.role != 'admin') {
        stmnt = stmnt.where('vu_id', '=', vu.id);
    }
    stmnt = stmnt.orderBy('id', 'DESC');
    stmnt = stmnt.limit(20);
    stmnt = stmnt.paginate({perPage: req.body.per_page, currentPage: req.body.page});


    await stmnt.then((rows) => {
        calls = rows;
    });


    let fixed_calls = [];
    for (let call of calls.data) {
        fixed_calls.push(await format_mod.format_call(call));
    }

    return_data['calls'] = fixed_calls;
    return_data['pagination'] = calls.pagination;


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/create_user Create a user
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
router.post('/vendor/create_user', async function (req, res, next) {


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
        await global_vars.knex('vendors_users').insert(insert_data).then((result) => {
            console.log("done");
            success = true;
        });
    }

    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/list_users List users
 * @apiName VendorListUsers
 * @apiGroup Vendor
 * @apiDescription List the users of the logged in vendor
 *
 * @apiParam {String} vu_token The vendor token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/list_users', async function (req, res, next) {


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


/**
 * @api {post} /vendor/list_services List services
 * @apiName VendorListServices
 * @apiGroup Vendor
 * @apiDescription List of the services
 *
 * @apiParam {String} vu_token The vendor token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/list_services', async function (req, res, next) {


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
        let vendors_services = null;
        await global_vars.knex('vendors_services').select('*').where('vendor_id', '=', vu.vendor.id).orderBy('id', 'DESC').then((rows) => {
            vendors_services = rows;
        });


        return_data['services'] = vendors_services;
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
