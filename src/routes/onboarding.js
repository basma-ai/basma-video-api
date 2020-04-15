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
 * @apiParam {String} [organization_name] The ID of the vendor to list their services
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/onboarding/join', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    // check the validity of the provided token
    const guest_id = await users_mod.token_to_id('guests', req.body.guest_token, 'id');
    if (guest_id == null) {
        if (return_data['errors'] == null) {
            return_data['errors'] = [];
        }
        return_data['errors'].push('invalid_guest_token');
        go_ahead = false;
    }


    if (go_ahead) {
        // and now, do the insertion
        await global_vars.knex('services').select('*')
            .where('vendor_id', '=', req.body.vendor_id)
            .where('is_deleted', '=', false)
            .then((rows) => {
            return_data['services'] = rows;
            success = true;
        });
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
    socket_mod.init(global_vars);
    calls_mod.init(global_vars);
    messages_mod.init(global_vars);

    return router;
};
