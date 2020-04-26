let express = require('express');
let router = express.Router();
const stripe = require('stripe')(process.env.MODE == 'prod' ? process.env.STRIPE_PROD_KEY : process.env.STRIPE_DEV_KEY);

const {check, validationResult} = require('express-validator');

let global_vars;


router.post('/stripe_webhooks/subscription_update', async function (req, res) {

    const sig = req.headers['stripe-signature'];

    let event;

    // try {
    //     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    // }
    // catch (err) {
    //     res.status(400).send(`Webhook Error: ${err.message}`);
    //     return;
    // }

    await new Promise(r => setTimeout(r, 1000));

    console.log("subscription_update webhook triggered");
    // console.log(JSON.stringify(req.body));


    let sub_object = req.body.data.object;

    if(sub_object.id != null) {
        // get the subscription id
        let sub_record;
        await global_vars.knex('billing_subscriptions')
            .where('stripe_sub_id', sub_object.id)
            .then((rows) => {
                sub_record = rows[0]
            }).catch();

        // update the status
        await global_vars.knex('billing_subscriptions')
            .where('stripe_sub_id', sub_object.id)
            .update({
                status: sub_object.status,
            }).then().catch();

        // insert log update
        await global_vars.knex('billing_subscriptions_log').insert({
            subscription_id: sub_record.id,
            time: Date.now(),
            status: sub_object.status,
            stripe_dump: JSON.stringify(sub_object)
        }).then().catch();

        if (sub_object.status == 'active') {
            // find the package id
            await global_vars.billing_mod.update_vendor_package({
                vendor_id: sub_record.vendor_id,
                stripe_plan: sub_record.plan
            });
        } else {
            await global_vars.billing_mod.update_vendor_package({
                vendor_id: sub_record.vendor_id,
                package_id: 5
            });
        }
    }

    res.send("Ok stripe, thanks for the update");

});

module.exports = function (options) {

    global_vars = options;

    return router;
};
