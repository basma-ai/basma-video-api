var express = require('express');
var router = express.Router();

var users_mod = require("../../modules/users_mod");
var format_mod = require("../../modules/format_mod");
var twilio_mod = require("../../modules/twilio_mod");
var roles_mod = require("../../modules/roles_mod");

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

    console.log(`vu_id: ${vu_id}`);

    const vu = await format_mod.get_vu(vu_id);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.SUPERUSER]);

    // # TOTAL CALLS
    let total_calls = 0;

    let stmnt = global_vars.knex('calls').count('id as count');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    if (!is_authenticated) {
        stmnt = stmnt.where('vu_id', '=', vu.id);
    }
    await stmnt.then((result) => {
        total_calls = result[0].count;
    });
    return_data['total_calls'] = total_calls;

    // # ANSWERED CALLS
    let answered_calls = 0;
    stmnt = global_vars.knex('calls').count('id as count');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);
    stmnt = stmnt.where('status', '=', 'ended');

    if (!is_authenticated) {
        stmnt = stmnt.where('vu_id', '=', vu.id);
    }
    await stmnt.then((result) => {
        answered_calls = result[0].count;
    });

    return_data['answered_calls'] = answered_calls;

    // # UNANSWERED CALLS
    let unanswered_calls = 0;
    stmnt = global_vars.knex('calls').count('id as count');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);
    stmnt = stmnt.where('status', '!=', 'ended');

    if (!is_authenticated) {
        stmnt = stmnt.where('vu_id', '!=', vu.id);
    }
    await stmnt.then((result) => {
        unanswered_calls = result[0].count;
    });

    return_data['unanswered_calls'] = unanswered_calls;

    // # TOP SERVICES
    let top_services = [];
    stmnt = global_vars.knex('calls').select('vendor_service_id').count('vendor_service_id as value_occurrence').groupBy('vendor_service_id').orderBy('value_occurrence', 'DESC');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    if (!is_authenticated) {
        stmnt = stmnt.where('vu_id', '!=', vu.id);
    }


    await stmnt.then((result) => {
        top_services = result;
    });

    return_data['top_services'] = [];
    for (let service of top_services) {
        return_data['top_services'].push(await format_mod.get_service(service.vendor_service_id));
    }

    // # MOST ACTIVE AGENTS
    let most_active = [];
    stmnt = global_vars.knex('calls').select('vu_id').count('vu_id as value_occurrence').groupBy('vu_id').orderBy('value_occurrence', 'DESC');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);

    if (!is_authenticated) {
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

    // # AVERAGE CALL DURATION
    let average_call_duration = 0;
    stmnt = global_vars.knex('calls').avg('duration as avg_duration');
    stmnt = stmnt.where('vendor_id', '=', vu.vendor.id);
    stmnt = stmnt.where('status', '=', 'ended');
    stmnt = stmnt.whereNot('duration', null);
    stmnt = stmnt.whereNot('duration', 0);

    if (!is_authenticated) {
        stmnt = stmnt.where('vu_id', '=', vu.id);
    }
    await stmnt.then((result) => {
        average_call_duration = result[0].avg_duration
    });

    return_data['average_call_duration'] = parseInt(average_call_duration);

    // # AVERAGE RATING

    let average_rating = 0;
    stmnt = global_vars.knex('calls').avg({
        avg_rating: 'ratings.rating'
    });
    stmnt = stmnt.leftJoin('ratings', 'ratings.call_id', 'calls.id')
    stmnt = stmnt.where('calls.vendor_id', '=', vu.vendor.id);
    stmnt = stmnt.where('calls.status', '=', 'ended');
    stmnt = stmnt.whereNot('ratings.rating', null);

    if (!is_authenticated) {
        stmnt = stmnt.where('vu_id', '=', vu.id);
    }
    await stmnt.then((result) => {
        average_rating = result[0].avg_rating
    });

    return_data['average_rating'] = parseFloat(average_rating).toFixed(2);

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
