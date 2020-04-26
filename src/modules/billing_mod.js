require('dotenv').config()
const axios = require('axios');

var global_vars = null;
const stripe = require('stripe')(process.env.MODE == 'prod' ? process.env.STRIPE_PROD_KEY : process.env.STRIPE_DEV_KEY);


module.exports = {

    init: function (new_global_vars) {
        global_vars = new_global_vars;
    },


    add_vendor_payment_method: async function (params) {


        let success = false;
        // params: vu, stripe_payment_method_id

        // check if the vendor is registered with stripe
        // get full vendor
        let vendor = await global_vars.format_mod.get_vendor(params.vu.vendor.id, 'root');

        let stripe_customer_id;
        if (vendor.root_stripe_customer_id == null || vendor.root_stripe_customer_id == '') {
            // no stripe customer :(, let's create one

            let customer = await stripe.customers.create({
                payment_method: params.stripe_payment_method_id,
                name: params.vu.name,
                email: params.vu.email,
                invoice_settings: {
                    default_payment_method: params.stripe_payment_method_id,
                },
                metadata: {
                    basma_vendor_id: params.vu.vendor.id,
                    basma_vendor_name: params.vu.vendor.name,
                    basma_vu_id: params.vu.id,
                    basma_vu_name: params.vu.name,
                    basma_vu_email: params.vu.email
                }
            }).then((result) => {
                success = true;
                stripe_customer_id = result.id;

                // console.log("I am here, ");
                // console.log(result);


            }).catch((err) => {
                console.log("error adding payment method");
                // console.log(JSON.stringify(err));
            });

            if (success) {
                // update the vendor
                await global_vars.knex('vendors')
                    .where('id', '=', params.vu.vendor.id)
                    .update({
                        'root_stripe_customer_id': stripe_customer_id
                    }).then().catch();
            }

        } else {

            stripe_customer_id = vendor.root_stripe_customer_id;


            await stripe.paymentMethods.attach(
                params.stripe_payment_method_id,
                {customer: stripe_customer_id}).then((result) => {
                success = true
            }).catch((err) => {
                success = false;
            });


        }


        console.log("returning: " + success);

        return success;


    },

    list_payment_methods: async function (params) {

        let success = true;
        let final_list;
        // params: vu, stripe_payment_method_id

        // check if the vendor is registered with stripe
        // get full vendor
        let vendor = await global_vars.format_mod.get_vendor(params.vu.vendor.id, 'root');

        let stripe_customer_id;
        if (vendor.root_stripe_customer_id != null) {
            // no stripe customer :(, let's create one

            await stripe.paymentMethods.list(
                {customer: vendor.root_stripe_customer_id, type: 'card'}).then((result) => {
                final_list = result.data;
            }).catch();


        }

        return final_list;


    },

    detach_payment_method: async function (params) {

        let success = false;
        let final_list;
        // params: vu, stripe_payment_method_id

        // check if the vendor is registered with stripe
        // get full vendor
        let vendor = await global_vars.format_mod.get_vendor(params.vu.vendor.id, 'root');

        let stripe_customer_id;
        if (vendor.root_stripe_customer_id != null) {
            // no stripe customer :(, let's create one

            await stripe.paymentMethods.detach(params.stripe_payment_method_id).then((result) => {
                console.log(result);
                success = true;
            }).catch((err) => {

            });


        }

        return success;


    },

    create_subscription: async function (params) {

        let success = false;
        let final_list;
        // params: vu, stripe_payment_method_id

        // check if the vendor is registered with stripe
        // get full vendor
        let vendor = await global_vars.format_mod.get_vendor(params.vu.vendor.id, 'root');

        let stripe_customer_id;
        if (vendor.root_stripe_customer_id != null) {
            // no stripe customer :(, let's create one

            let package = await global_vars.format_mod.get_package(params.package_id, 'root');

            let stripe_plan_id = '';

            switch (params.type) {
                case 'annually':
                    stripe_plan_id = package['stripe_annual_plan_id']
                    break;
                default:
                    stripe_plan_id = package['stripe_monthly_plan_id']
                    break;
            }

            console.log(stripe_plan_id);

            let pass_data = {
                customer: vendor.root_stripe_customer_id,
                items: [{plan: stripe_plan_id}],
                expand: ["latest_invoice"]
            };

            if (params.stripe_payment_method_id != null) {
                pass_data['default_payment_method'] = params.stripe_payment_method_id;
            }

            let payment;

            let return_data = {};
            let stripe_sub_id;
            let subscription_object;
            await stripe.subscriptions.create(pass_data).then(async (result) => {
                // console.log(JSON.stringify(result))
                subscription_object = {
                    success: true,
                    invoice_url_hosted: result.latest_invoice.hosted_invoice_url,
                    invoice_url_pdf: result.latest_invoice.invoice_pdf,
                    payment_complete: result.latest_invoice.paid,
                    period_start: result.latest_invoice.period_start,
                    period_end: result.latest_invoice.period_end,
                    status: result.latest_invoice.status,
                    status_transitions: result.latest_invoice.status_transitions
                }

                return_data['subscription'] = subscription_object;
                // console.log("I am here in the then");

                if (subscription_object.status == 'open') {
                    // get the payment intent
                    let payment_intent_id = result.latest_invoice.payment_intent;

                    return_data['stripe_payment_intent_id'] = payment_intent_id;

                    // check the intent status
                    const intent = await stripe.paymentIntents.confirm(payment_intent_id, {
                        return_url: 'https://dashboard.dev.basma.ai/payments/return',
                    }).then((result) => {
                        console.log("intent success");
                        return_data['stripe_payment_intent'] = result;

                    }).catch((err) => {
                        if(return_data['stripe_payment_intent'] == null) {
                            return_data['stripe_payment_intent'] = err.raw.payment_intent;
                        }

                    });
                }

                stripe_sub_id = result.id;


            }).catch((err) => {
                console.log(JSON.stringify(err));

                let errors = [];
                if (err.param != null) {
                    errors.push(err.param);
                }
                if (err.code != null) {
                    errors.push(err.code);
                }
                return_data['errors'] = errors;

            });

            if (stripe_sub_id != null) {
                let billing_subscription_id;
                await global_vars.knex('billing_subscriptions').insert({
                    vendor_id: params.vu.vendor.id,
                    stripe_sub_id: stripe_sub_id,
                    creation_time: Date.now(),
                    plan: stripe_plan_id,
                    status: subscription_object.status
                }).then(result => {
                    billing_subscription_id = result;
                }).catch();

                // insert a log
                await global_vars.knex('billing_subscriptions_log').insert({
                    subscription_id: billing_subscription_id,
                    time: Date.now(),
                    status: subscription_object.status,
                    stripe_dump: JSON.stringify(subscription_object)
                }).then().catch();

            }

            return return_data;


        }

        return false;


    },

    list_invoices: async function (params) {

        let success = false;
        let final_list;
        // params: vu, stripe_payment_method_id

        // check if the vendor is registered with stripe
        // get full vendor
        let vendor = await global_vars.format_mod.get_vendor(params.vu.vendor.id, 'root');

        let stripe_customer_id;
        if (vendor.root_stripe_customer_id != null) {
            // no stripe customer :(, let's create one

            let invoices = [];
            await stripe.invoices.list(
                {
                    // limit: 3,
                    customer: vendor.root_stripe_customer_id,
                }
            ).then((newInvoices) => {
                invoices = newInvoices;
            }).catch();
            return invoices.data;

        }

        return false;


    },

    update_vendor_package: async function (params) {


        let success = false;

        let package_id;
        if(params.stripe_plan != null) {
            // find package id by un
            await global_vars.knex('packages')
                .select('*')
                .where('stripe_annual_plan_id', params.stripe_plan)
                .orWhere('stripe_monthly_plan_id', params.stripe_plan)
                .then((rows) => {
                    package_id = rows[0].id;
                }).catch();
        } else if(params.package_id != null) {
            package_id = params.package_id;
        }


        await global_vars.knex('vendors')
            .where('id', params.vendor_id)
            .update({
                package_id: package_id
            }).then((result) => {
                success = true
            }).catch((result) => {
                success = false
            });

        return success;
    }


}
