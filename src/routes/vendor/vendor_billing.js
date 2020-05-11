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

/**
 * @api {post} /vendor/billing/create_subscription Create a subscription
 * @apiName VendorBillingCreateSubscription
 * @apiGroup vendor
 * @apiDescription Create a subscription
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} package_id
 * @apiParam {String} type "monthly" or "annually"
 * @apiParam {String} [stripe_payment_method_id]
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/billing/create_subscription', [
    check('package_id').isLength({min: 1})
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
        return_data = await global_vars.billing_mod.create_subscription({
            vu: vu,
            type: req.body.type,
            package_id: req.body.package_id,
            stripe_payment_method_id: req.body.stripe_payment_method_id
        });
        if(return_data.errors != null) {
            success = false;
        }


    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/billing/overview Get billing overview
 * @apiName VendorBillingOverview
 * @apiGroup vendor
 * @apiDescription Get billing overview
 *
 * @apiParam {String} vu_token Vendor User Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/billing/overview', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.BILLING]);

    if (is_authenticated) {


        // get current package
        return_data['package'] = await format_mod.get_package(vu.vendor.package_id);


        return_data['subscriptions'] = [];
        await global_vars.knex('billing_subscriptions')
            .where('vendor_id', vu.vendor.id)
            .orderBy('id', 'DESC')
            .then((rows) => {
                return_data['subscriptions'] = rows;
            }).catch();

        return_data['services'] = await global_vars.packages_mod.check_package_limit({
            package_id: vu.vendor.package_id,
            vendor_id: vu.vendor.id,
            table_name: 'services',
            package_field: 'services'
        });

        return_data['groups'] = await global_vars.packages_mod.check_package_limit({
            package_id: vu.vendor.package_id,
            vendor_id: vu.vendor.id,
            table_name: 'groups',
            package_field: 'groups'
        });

        return_data['users'] = await global_vars.packages_mod.check_package_limit({
            package_id: vu.vendor.package_id,
            vendor_id: vu.vendor.id,
            table_name: 'vendors_users',
            package_field: 'users'
        });

        return_data['custom_fields'] = await global_vars.packages_mod.check_package_limit({
            package_id: vu.vendor.package_id,
            vendor_id: vu.vendor.id,
            package_field: 'custom_fields',
            table_name: 'custom_fields'
        });

        return_data['chat'] = await global_vars.packages_mod.check_package_limit({
            package_id: vu.vendor.package_id,
            vendor_id: vu.vendor.id,
            package_field: 'chat'
        });
        return_data['exchange_files'] = await global_vars.packages_mod.check_package_limit({
            package_id: vu.vendor.package_id,
            vendor_id: vu.vendor.id,
            package_field: 'chat'
        });


        success = true;

    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});



/**
 * @api {post} /vendor/billing/get_packages Get packages
 * @apiName VendorBillingPackagesGet
 * @apiGroup vendor
 * @apiDescription Get billing overview
 *
 * @apiParam {String} vu_token Vendor User Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/billing/packages_list', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.BILLING]);

    if (is_authenticated) {


        let raw_packages;
        await global_vars.knex('packages').select('*')
            .where('display_on_site', true)
            .then((rows) => {
                raw_packages = rows;
            });

        let packages = [];
        for(let raw_package of raw_packages) {
            packages.push(await global_vars.format_mod.get_package(raw_package.id));
        }

        return_data['list'] = packages;
        success = true;

    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});



/**
 * @api {post} /vendor/billing/list_invoices List invoices
 * @apiName VendorBillingInvoicesList
 * @apiGroup vendor
 * @apiDescription Get billing overview
 *
 * @apiParam {String} vu_token Vendor User Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/billing/invoices_list', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu, [roles_mod.PERMISSIONS.BILLING]);

    if (is_authenticated) {


        // all good, let's fire the method to add it
        let list = await global_vars.billing_mod.list_invoices({
            vu: vu
        });


        success = true;
        return_data['list'] = list;

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
