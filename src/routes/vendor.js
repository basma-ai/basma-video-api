var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var twilio_mod = require("../modules/twilio_mod");
const setupPaginator = require('el7r-knex-paginator');

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

    if(vu.role != 'admin') {
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

    if(vu.role != 'admin') {
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

    if(vu.role != 'admin') {
        stmnt = stmnt.where('vu_id', '!=', vu.id);
    }
    await stmnt.then((result) => {
        unanswered_calls = result[0].count;
    });

    return_data['unanswered_calls'] = unanswered_calls;

    // answered_calls
    let top_services = [];
    stmnt = global_vars.knex('calls').select('vendor_service_id').count('vendor_service_id as value_occurrence').groupBy('vendor_service_id').orderBy('value_occurrence', 'DESC');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    if(vu.role != 'admin') {
        stmnt = stmnt.where('vu_id', '!=', vu.id);
    }


    await stmnt.then((result) => {
        top_services = result;
    });

    return_data['top_services'] = [];
    for(let service of top_services) {
        return_data['top_services'].push(await format_mod.get_vendor_service(service.vendor_service_id));
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

    setupPaginator(global_vars.knex);

    let success = true;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id);

    // get cals
    let calls = [];

    let stmnt = global_vars.knex('calls').select('*');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    if(vu.role != 'admin') {
        stmnt = stmnt.where('vu_id', '=', vu.id);
    }
    stmnt = stmnt.orderBy('id', 'DESC');
    stmnt = stmnt.paginate(1, 1, true);



    await stmnt.then((rows) => {
        calls = rows;
    });

    let fixed_calls = [];
    for(let call of calls) {
        fixed_calls.push(await format_mod.format_call(call));
    }

    return_data['calls'] = fixed_calls;




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