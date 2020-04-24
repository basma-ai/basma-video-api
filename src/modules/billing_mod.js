require('dotenv').config()
const axios = require('axios');

var global_vars = null;
const stripe = require('stripe')('sk_test_fjeet5YkPsguNMliFZGUHllL0031WN0TVZ');


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

                console.log("I am here, ");
                console.log(result);


            }).catch((err) => {
                console.log("error");
                console.log(JSON.stringify(err));
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


    }


}
