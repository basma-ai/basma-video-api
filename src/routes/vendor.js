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


    let success = false;
    let go_ahead = true;
    let return_data = {};


    return_data['hello'] = 'how are you';

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
