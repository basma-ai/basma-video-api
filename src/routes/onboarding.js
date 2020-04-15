let express = require('express');
let router = express.Router();

let users_mod = require("../modules/users_mod");
let format_mod = require("../modules/format_mod");
let twilio_mod = require("../modules/twilio_mod");
var socket_mod = require("../modules/socket_mod");
var calls_mod = require("../modules/calls_mod");
var messages_mod = require("../modules/messages_mod");

let global_vars;


/**
 * @api {post} /onboarding/join Create a vendor
 * @apiName OnboardingJoin
 * @apiGroup Onboarding
 * @apiDescription Join a vendor
 *
 * @apiParam {String} [organization_name] The ID of the vendor to list their services
 * @apiParam {String} [organization_username] The ID of the vendor to list their services
 *
 * @apiParam {String} [email] The ID of the vendor to list their services
 * @apiParam {String} [name] The ID of the vendor to list their services
 * @apiParam {String} [phone_number] The ID of the vendor to list their services
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/onboarding/join', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    // data validity checks


    res.send({
        success: success,
        data: return_data
    });

});


module.exports = function (options) {

    global_vars = options;
    users_mod.init(global_vars);
    format_mod.init(global_vars);
    socket_mod.init(global_vars);
    calls_mod.init(global_vars);
    messages_mod.init(global_vars);

    return router;
};
