var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var twilio_mod = require("../modules/twilio_mod");

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

    if (vu.role != 'admin') {
        stmnt = stmnt.where('vu_id', '=', vu.id);
    }
    stmnt = stmnt.orderBy('id', 'DESC');
    // stmnt = stmnt.limit(20);
    stmnt = stmnt.paginate({perPage: req.body.per_page, currentPage: req.body.page});


    await stmnt.then((rows) => {
        calls = rows;
    });


    let fixed_calls = [];
    for (let call of calls.data) {
        fixed_calls.push(await format_mod.format_call(call, false));
    }

    return_data['list'] = fixed_calls;
    return_data['pagination'] = calls.pagination;


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
