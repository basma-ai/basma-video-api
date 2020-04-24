var express = require('express');
var router = express.Router();

var users_mod = require("../../modules/users_mod");
var format_mod = require("../../modules/format_mod");
var data_utils = require("../../modules/data_utils");
var log_mod = require("../../modules/log_mod");
var roles_mod = require("../../modules/roles_mod");
const {check, validationResult} = require('express-validator');

var global_vars;


/**
 * @api {post} /vendor/billing/payment_method_add Add a payment method
 * @apiName VendorBillingPaymentMethodAdd
 * @apiGroup vendor
 * @apiDescription Add a payment method
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {String} stripe_payment_method_id Self explanatory
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/billing/payment_method_add', [
    check('stripe_payment_method_id').isLength({min: 10})
], async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.BILLING]);

    if (is_authenticated) {

        // all good, let's fire the method to add it
        success = await global_vars.billing_mod.add_vendor_payment_method({
            vu: vu,
            stripe_payment_method_id: req.body.stripe_payment_method_id
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
 * @api {post} /vendor/billing/payment_method_list List payment methods
 * @apiName VendorBillingPaymentMethodList
 * @apiGroup vendor
 * @apiDescription List payment methods
 *
 * @apiParam {String} vu_token Vendor User Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/billing/payment_method_list', [
], async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.BILLING]);

    if (is_authenticated) {

        // all good, let's fire the method to add it
        return_data['list'] = await global_vars.billing_mod.list_payment_methods({
            vu: vu
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
 * @api {post} /vendor/billing/payment_method_detach Detach a payment method
 * @apiName VendorBillingPaymentMethodDetach
 * @apiGroup vendor
 * @apiDescription Detach a payment method
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {String} stripe_payment_method_id
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/billing/payment_method_detach', [
    check('stripe_payment_method_id').isLength({min: 10})
], async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.BILLING]);

    if (is_authenticated) {

        // all good, let's fire the method to add it
        success = await global_vars.billing_mod.detach_payment_method({
            vu: vu,
            stripe_payment_method_id: req.body.stripe_payment_method_id
        });


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
    log_mod.init(global_vars);
    roles_mod.init(global_vars);
    data_utils.init(global_vars);

    return router;
};
