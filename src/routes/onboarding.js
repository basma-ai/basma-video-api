let express = require('express');
let router = express.Router();

let users_mod = require("../modules/users_mod");
let format_mod = require("../modules/format_mod");
let twilio_mod = require("../modules/twilio_mod");
var socket_mod = require("../modules/socket_mod");
var calls_mod = require("../modules/calls_mod");
var messages_mod = require("../modules/messages_mod");
var onboarding_mod = require("../modules/onboarding_mod");
const {check, validationResult} = require('express-validator');
var Recaptcha = require('express-recaptcha').RecaptchaV3;
//import Recaptcha from 'express-recaptcha'
var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);

let global_vars;


/**
 * @api {post} /onboarding/join Create a vendor
 * @apiName OnboardingJoin
 * @apiGroup Onboarding
 * @apiDescription Join a vendor
 *
 * @apiParam {String} org_name
 * @apiParam {String} org_username
 *
 * @apiParam {String} username
 * @apiParam {String} email
 * @apiParam {String} name
 * @apiParam {String} phone_number
 * @apiParam {String} password
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/onboarding/join', [
    check('org_name').isLength({min: 5, max: 100}),
    check('org_username').isLength({min: 4, max: 20}),
    check('username').isLength({min: 3, max: 20}),
    check('name').isLength({min: 3, max: 100}),
    check('email')
        .isEmail()
        .normalizeEmail(),
    check('phone_number')
        .isMobilePhone(),
    check('password').isLength({min: 6}),
    recaptcha.middleware.verify
], async function (req, res, next) {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({success: false, data: {errors: errors.array()}});
    }


    let success = false;
    let go_ahead = true;
    let return_data = {};


    if (req.recaptcha.error) {
        go_ahead = false;
        success = false;
        return_data['errors'] = ['invalid_captcha'];
    }

    if (go_ahead) {
        let do_join = await onboarding_mod.create_vendor(req.body);

        if (do_join == "org_username_taken") {
            success = false;
            return_data['errors'] = [do_join];
        } else {
            success = true;
            return_data['join'] = do_join;
        }
    }


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /onboarding/verify_otp Verify OTP
 * @apiName OnboardingVerify
 * @apiGroup Onboarding
 * @apiDescription Verify OTP (vendor)
 *
 * @apiParam {Integer} vendor_id
 * @apiParam {Integer} pin
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/onboarding/verify_otp', [
    check('vendor_id').isInt(),
    check('pin').isLength({min: 4}),
    recaptcha.middleware.verify
], async function (req, res, next) {


    const errors_of_captcha = validationResult(req);
    if (!errors_of_captcha.isEmpty()) {
        return res.json({success: false, data: {errors: errors_of_captcha.array()}});
    }


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({success: false, data: {errors: errors.array()}});
    }


    let success = false;
    let go_ahead = true;
    let return_data = {};

    // if (req.recaptcha.error) {
    //     go_ahead = false;
    //     success = false;
    //     return_data['errors'] = ['invalid_captcha'];
    // }

    // find it in the tokens
    if (go_ahead) {
        let found = false;
        let already_verified = false;
        await global_vars.knex('vendors_phone_tokens')
            .select('vendors_phone_tokens.*', 'vendors.phone_verified')
            .leftJoin('vendors', 'vendors.id', 'vendors_phone_tokens.vendor_id')
            .where('vendors_phone_tokens.vendor_id', req.body.vendor_id)
            .where('vendors_phone_tokens.token', req.body.pin)
            .then((rows) => {

                if (rows.length > 0) {
                    found = true;

                    if (rows[0]['phone_verified']) {


                        already_verified = true;
                        go_ahead = false;
                    }
                }
            }).catch((err) => {
                console.log(err);
            });


        if (found && go_ahead) {


            // update it
            let updated = false;
            await global_vars.knex('vendors')
                .where('id', req.body.vendor_id)
                .update({
                    phone_verified: true
                }).then((result) => {
                    updated = true;
                    success = true;
                }).catch((err) => {
                    console.log(err);
                });


        }

        if (already_verified) {
            success = false;
            return_data['errors'] = ['already_verified'];
        }
    }

    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /onboarding/resend_otp Resend OTP
 * @apiName OnboardingResendOTP
 * @apiGroup Onboarding
 * @apiDescription Resend OTP (vendor)
 *
 * @apiParam {Integer} vendor_id
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/onboarding/resend_otp', [
    check('vendor_id').isInt(),
], async function (req, res, next) {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({success: false, data: {errors: errors.array()}});
    }


    let success = false;
    let go_ahead = true;
    let return_data = {};

    // get the current one
    let valid_req = false
    let limit_exceeded = false
    await global_vars.knex('vendors_phone_tokens')
        .select('vendors_phone_tokens.*', 'vendors.phone_verified')
        .leftJoin('vendors', 'vendors.id', 'vendors_phone_tokens.vendor_id')
        .where('vendors_phone_tokens.vendor_id', req.body.vendor_id)
        .orderBy('id', 'DESC')
        .then((rows) => {

            // console.log(rows);
            if (rows.length > 0) {

                // get the time
                let last_req_time = rows[0]['creation_time'];
                let time_diff = Date.now() - last_req_time;

                if (time_diff > 30000 && !rows[0].phone_verified) {
                    valid_req = true;
                }

            }

            if (rows.length > 5) {
                valid_req = false;
                limit_exceeded = true;
            }


        }).catch();

    if (valid_req) {

        // // delete existing
        // await global_vars.knex('vendors_phone_tokens')
        //     .where('vendor_id', req.body.vendor_id)
        //     .delete()
        //     .then().catch();

        // send sms

        // get the only user
        let only_user = null;
        await global_vars.knex('vendors_users')
            .where('vendor_id', req.body.vendor_id)
            .then((rows) => {
                only_user = rows[0]
            }).catch();


        if (only_user != null) {
            // create and sms the new phone verification token
            let token = await global_vars.users_mod.create_token('vendors_phone_tokens', 'vendor_id', req.body.vendor_id);

            await global_vars.notifs_mod.sendSMS(only_user.phone_number, `${token} is you verification pin`);

            success = true;
        }

    } else if (limit_exceeded) {
        success = false;
        return_data['errors'] = ['limit_exceeded'];
    } else {
        success = false;
        return_data['errors'] = ['wait_30sec'];
    }


    // find it in the tokens


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /onboarding/check_org_username Check organization username
 * @apiName OnboardingCheckUsername
 * @apiGroup Onboarding
 * @apiDescription Check kif organization username is available
 *
 * @apiParam {String} org_username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/onboarding/check_org_username', [
    check('org_username').isLength({min: 1}),
    recaptcha.middleware.verify
], async function (req, res, next) {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({success: false, data: {errors: errors.array()}});
    }


    let success = false;
    let go_ahead = true;
    let return_data = {};

    return_data['username_exists'] = false;

    if (req.recaptcha.error) {
        go_ahead = false;
        success = false;
        return_data['errors'] = ['invalid_captcha'];
    }

    if (go_ahead) {
        await global_vars.knex('vendors')
            .select('username')
            .where('username', req.body.org_username)
            .then((rows) => {
                success = true;
                if (rows.length > 0) {
                    return_data['username_exists'] = true;
                }
            }).catch();
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
    onboarding_mod.init(global_vars);

    return router;
};
