var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var twilio_mod = require("../modules/twilio_mod");
var roles_mod = require("../modules/roles_mod");

var global_vars;

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
router.post('/vendor/calls/list', async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id);

    // get cals
    let calls = [];

    let stmnt = global_vars.knex('calls').select('*');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.SUPERUSER]);

    if (!is_authenticated) {
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
        fixed_calls.push(await format_mod.format_call(call, false));
    }

    return_data['list'] = fixed_calls;
    return_data['pagination'] = calls.pagination;


    res.send({
        success: success,
        data: return_data
    });

});



/**
 * @api {post} /vendor/calls/get Get a cal
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
router.post('/vendor/calls/get', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // get the call
    let call = await format_mod.get_agent_call(req.body.call_id);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.CALLS_HISTORY]);

    if (is_authenticated || call.vu_id == vu.id) {

        return_data['call'] = await format_mod.format_call(call, true);
        success = true;

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

    return router;
};
