let express = require('express');
let router = express.Router();

let users_mod = require("../modules/users_mod");
let format_mod = require("../modules/format_mod");
let twilio_mod = require("../modules/twilio_mod");

let global_vars;


/**
 * @api {post} /calls/get_services Get list of services of a vendor
 * @apiName CallsGetServices
 * @apiGroup Calls
 * @apiDescription Get a list of services provided by a specific vendor
 *
 * @apiParam {String} [guest_token] The access token of the guest
 * @apiParam {Integer} [vendor_id] The ID of the vendor to list their services
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/calls/get_services', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    // check the validity of the provided token
    const guest_id = await users_mod.token_to_id('guests', req.body.guest_token, 'id');
    if(guest_id == null) {
        if (return_data['errors'] == null) { return_data['errors'] = []; }
        return_data['errors'].push('invalid_guest_token');
        go_ahead = false;
    }


    if(go_ahead) {
        // and now, do the insertion
        await global_vars.knex('vendors_services').select('*').where('vendor_id', '=', req.body.vendor_id).then((rows) => {
            return_data['services'] = rows;
            success = true;
        });
    }

    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /calls/start_call Start a call
 * @apiName CallsStart
 * @apiGroup Calls
 * @apiDescription Start call, must be started by a guest
 *
 * @apiParam {String} guest_token The access token of the guest
 * @apiParam {Integer} service_id The ID of the service
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "success": true,
    "data": {
        "call_id": 4
    }
}
 */
router.post('/calls/start_call', async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    // check the validity of the provided token
    const guest_id = await users_mod.token_to_id('guests', req.body.guest_token, 'id');
    if(guest_id == null) {
        if (return_data['errors'] == null) { return_data['errors'] = []; }
        return_data['errors'].push('invalid_guest_token');
        go_ahead = false;
    }


    if(go_ahead) {
        // get the service
        var the_service = null;
        await global_vars.knex('vendors_services').select('*').where('id','=',req.body.service_id).then((rows) => {
            if(rows[0] != null) {
                the_service = rows[0];
            }
        });

        if(the_service == null) {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('invalid_service_id');
            go_ahead = false;
        }

        if(go_ahead) {
            // cool, we reached here, now let's initiate the call
            let insert_data = {
                guest_id: guest_id,
                vu_id: null,
                status: 'calling',
                vendor_id: the_service.vendor_id,
                vendor_service_id: the_service.id,
                creation_time: Date.now(),
                last_refresh_time: Date.now()
            };


            await global_vars.knex('calls').insert(insert_data).then((result) => {
                success = true;
                return_data['call_id'] = result[0];
            });
        }
    }

    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /calls/refresh_call Refresh a call
 * @apiName CallsRefresh
 * @apiGroup Calls
 * @apiDescription Refresh a call, must be called repeatedly with less then 5 seconds interval to keep the call active and ringing
 *
 * @apiParam {String} guest_token The access token of the guest
 * @apiParam {Integer} call_id The ID of the call
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "success": true,
    "data": {
        "call": {
            "id": 4,
            "guest_id": 1,
            "vu_id": null,
            "status": "calling",
            "creation_time": 1579097149332,
            "vendor_id": 1,
            "vendor_service_id": 2,
            "last_refresh_time": 1579098055243,
            "connection_guest_token": null
        }
    }
}
 */
router.post('/calls/refresh_call', async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    // check the validity of the provided token
    const guest_id = await users_mod.token_to_id( 'guests', req.body.guest_token, 'id');
    if(guest_id == null) {
        if (return_data['errors'] == null) { return_data['errors'] = []; }
        return_data['errors'].push('invalid_guest_token');
        go_ahead = false;
    }


    if(go_ahead) {
        // get the call
        var the_call = null;
        await global_vars.knex('calls').select('*').where('id','=',req.body.call_id).then((rows) => {
            if(rows[0] != null) {
                the_call = rows[0];
            }
        });

        if(the_call == null) {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('invalid_call_id');
            go_ahead = false;
        }

        if(go_ahead && the_call.guest_id != guest_id) {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('unauthorized_action');
            go_ahead = false;
        }

        if(go_ahead && the_call.status == 'ended') {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('call_ended');
            go_ahead = false;
        }

        if(go_ahead) {
            // cool, we reached here, now let's initiate the call
            let update_data = {
                last_refresh_time: Date.now()
            };

            if(the_call['connection_guest_token'] == null) {
                // no token generated for the guest, let's make one
                var twilio_guest_token = twilio_mod.generate_twilio_token('guest-'+guest_id, 'call-'+the_call.id);
                // let's put it in the db
                await global_vars.knex('calls').update({
                    'connection_guest_token': twilio_guest_token
                }).where('id','=',the_call.id);
            }

            return_data['call'] = await format_mod.format_call(the_call);

            delete return_data['call']['connection_agent_token'];

            await global_vars.knex('calls').where('id','=',the_call.id).update(update_data).then((result) => {
                success = true;
            });
        }
    }

    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /calls/end_call End a call
 * @apiName CallsEnd
 * @apiGroup Calls
 * @apiDescription End a call
 *
 * @apiParam {String} [guest_token] The access token of the guest
 * @apiParam {Integer} call_id The ID of the call
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "success": true,
    "data": {
    }
}
 * @apiErrorExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "success": true,
    "data": {
        "errors": [
            "call_ended"
        ]
    }
}
 */
router.post('/calls/end_call', async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    // check the validity of the provided token
    const guest_id = await users_mod.token_to_id( 'guests', req.body.guest_token, 'id');
    if(guest_id == null) {
        if (return_data['errors'] == null) { return_data['errors'] = []; }
        return_data['errors'].push('invalid_guest_token');
        go_ahead = false;
    }


    if(go_ahead) {
        // get the call
        var the_call = null;
        await global_vars.knex('calls').select('*').where('id','=',req.body.call_id).then((rows) => {
            if(rows[0] != null) {
                the_call = rows[0];
            }
        });

        if(the_call == null) {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('invalid_call_id');
            go_ahead = false;
        }

        if(go_ahead && the_call.guest_id != guest_id) {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('unauthorized_action');
            go_ahead = false;
        }

        if(go_ahead && the_call.status == 'ended') {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('call_ended');
            go_ahead = false;
        }

        if(go_ahead) {

            twilio_mod.complete_room('call-'+the_call.id);

            // cool, we reached here, now let's initiate the call
            let update_data = {
                status: 'ended'
            };

            // return_data['call'] = the_call;

            await global_vars.knex('calls').where('id','=',the_call.id).update(update_data).then((result) => {
                success = true;
            });
        }
    }

    res.send({
        success: success,
        data: return_data
    });

});


router.post('/calls/test', async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    var twilio_token = twilio_mod.generate_twilio_token('clientname2323','thetestroom32423');

    return_data['twilio_token'] = twilio_token;

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
