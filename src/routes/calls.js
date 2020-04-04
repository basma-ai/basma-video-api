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
    if (guest_id == null) {
        if (return_data['errors'] == null) {
            return_data['errors'] = [];
        }
        return_data['errors'].push('invalid_guest_token');
        go_ahead = false;
    }


    if (go_ahead) {
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
    if (guest_id == null) {
        if (return_data['errors'] == null) {
            return_data['errors'] = [];
        }
        return_data['errors'].push('invalid_guest_token');
        go_ahead = false;
    }


    if (go_ahead) {
        // get the service
        var the_service = null;
        await global_vars.knex('vendors_services').select('*').where('id', '=', req.body.service_id).then((rows) => {
            if (rows[0] != null) {
                the_service = rows[0];
            }
        });

        if (the_service == null) {
            // no matching service found, halt
            if (return_data['errors'] == null) {
                return_data['errors'] = [];
            }
            return_data['errors'].push('invalid_service_id');
            go_ahead = false;
        }

        if (go_ahead) {
            // cool, we reached here, now let's initiate the call
            let insert_data = {
                guest_id: guest_id,
                vu_id: null,
                status: 'calling',
                vendor_id: the_service.vendor_id,
                vendor_service_id: the_service.id,
                creation_time: Date.now(),
                last_refresh_time: Date.now(),
                custom_fields_values: req.body.custom_fields_values == null ? null : JSON.stringify(req.body.custom_fields_values)
            };


            await global_vars.knex('calls').insert(insert_data).then((result) => {
                success = true;
                return_data['call_id'] = result[0];
            });

            if(success){
                return_data['call_info'] = await calls_mod.get_guest_call_refresh(return_data['call_id'], guest_id);

                calls_mod.update_all_calls(the_service.vendor_id);

            }


        }
    }

    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /calls/request_update Refresh a call
 * @apiName CallsRequest
 * @apiGroup Calls
 * @apiDescription Request a call update on the socket.io, must be called repeatedly with less then 5 seconds interval to keep the call active and ringing
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
router.post('/calls/request_update', async function (req, res, next) {


    const guest_id = await users_mod.token_to_id('guests', req.body.guest_token, 'id');

    await socket_mod.send_update({
        user_type: 'guest',
        user_id: guest_id,
        call_id: return_data['call_id'],
        type: 'call_info',
        data: await calls_mod.get_guest_call_refresh(req.body.call_id, guest_id)
    });


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
    const guest_id = await users_mod.token_to_id('guests', req.body.guest_token, 'id');
    if (guest_id == null) {
        if (return_data['errors'] == null) {
            return_data['errors'] = [];
        }
        return_data['errors'].push('invalid_guest_token');
        go_ahead = false;
    }


    if (go_ahead) {
        // get the call
        var the_call = null;
        await global_vars.knex('calls').select('*').where('id', '=', req.body.call_id).then((rows) => {
            if (rows[0] != null) {
                the_call = rows[0];
            }
        });

        if (the_call == null) {
            // no matching service found, halt
            if (return_data['errors'] == null) {
                return_data['errors'] = [];
            }
            return_data['errors'].push('invalid_call_id');
            go_ahead = false;
        }

        if (go_ahead && the_call.guest_id != guest_id) {
            // no matching service found, halt
            if (return_data['errors'] == null) {
                return_data['errors'] = [];
            }
            return_data['errors'].push('unauthorized_action');
            go_ahead = false;
        }

        if (go_ahead && the_call.status == 'ended') {
            // no matching service found, halt
            if (return_data['errors'] == null) {
                return_data['errors'] = [];
            }
            return_data['errors'].push('call_ended');
            go_ahead = false;
        }

        if (go_ahead) {

            // twilio_mod.complete_room('call-' + the_call.id);

            // cool, we reached here, now let's initiate the call
            let update_data = {
                status: 'ended',
                end_time: Date.now(),
                duration: (the_call['answer_time'] == null || the_call['answer_time'] == 0) ? 0 : Date.now() - the_call['answer_time']
            };

            // return_data['call'] = the_call;

            await global_vars.knex('calls').where('id', '=', the_call.id).update(update_data).then((result) => {
                success = true;
            });

            calls_mod.update_all_calls(the_call.vendor_id);
            calls_mod.end_call_stuff(the_call.id);

        }
    }

    res.send({
        success: success,
        data: return_data
    });

});




/**
 * @api {post} /calls/submit_rating Submit rating
 * @apiName CallsSubmitRating
 * @apiGroup Calls
 * @apiDescription Submit a rating for a call
 *
 * @apiParam {String} [guest_token] The access token of the guest
 * @apiParam {Integer} call_id The ID of the call
 * @apiParam {Integer} rating from 1 to 5, 5 being the best
 * @apiParam {String} feedback_text The feedback text
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
router.post('/calls/submit_rating', async function (req, res, next) {


    let success = true;
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
        // get the call
        var the_call = null;
        await global_vars.knex('calls').select('*').where('id', '=', req.body.call_id).then((rows) => {
            if (rows[0] != null) {
                the_call = rows[0];
            }
        });

        if (the_call == null) {
            // no matching service found, halt
            if (return_data['errors'] == null) {
                return_data['errors'] = [];
            }
            return_data['errors'].push('invalid_call_id');
            go_ahead = false;
        }

        if (go_ahead && the_call.guest_id != guest_id) {
            // no matching service found, halt
            if (return_data['errors'] == null) {
                return_data['errors'] = [];
            }
            return_data['errors'].push('unauthorized_action');
            go_ahead = false;
        }



        if (go_ahead) {

            // cool, we reached here, now let's initiate the call
            let insert_data = {
                call_id: the_call.id,
                guest_id: the_call.guest_id,
                time: Date.now(),
                rating: req.body.rating,
                feedback_text: req.body.feedback_text,
            };

            // return_data['call'] = the_call;

            await global_vars.knex('ratings').insert(insert_data).then((result) => {
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
 * @api {post} /calls/send_message Send a message
 * @apiName CallsMessagesSend
 * @apiGroup Calls
 * @apiDescription Send a message in a call
 *
 * @apiParam {String} [guest_token] The access token of the guest
 * @apiParam {Integer} call_id The ID of the call
 * @apiParam {String} message_type "text", "image" or "file"
 * @apiParam {String} value the value of the message
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

 */
router.post('/calls/send_message', async function (req, res, next) {


    let success = true;
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
        // get the call
        var the_call = null;
        await global_vars.knex('calls').select('*').where('id', '=', req.body.call_id).then((rows) => {
            if (rows[0] != null) {
                the_call = rows[0];
            }
        });

        if (the_call == null) {
            // no matching service found, halt
            if (return_data['errors'] == null) {
                return_data['errors'] = [];
            }
            return_data['errors'].push('invalid_call_id');
            go_ahead = false;
        }

        if (go_ahead && the_call.guest_id != guest_id) {
            // no matching service found, halt
            if (return_data['errors'] == null) {
                return_data['errors'] = [];
            }
            return_data['errors'].push('unauthorized_action');
            go_ahead = false;
        }

        if (go_ahead && the_call.status == 'ended') {
            // no matching service found, halt
            if (return_data['errors'] == null) {
                return_data['errors'] = [];
            }
            return_data['errors'].push('call_ended');
            go_ahead = false;
        }

        if (go_ahead) {

            // send the message
            await messages_mod.send_message({
                user_type: 'guest',
                user_id: guest_id,
                message_type: req.body.message_type,
                value: req.body.value,
                call_id: the_call.id
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


    // var twilio_token = twilio_mod.generate_twilio_token('clientname2323', 'thetestroom32423');



    return_data['recording'] = await twilio_mod.get_recordings('RMfa2b44ee9ab080f87218ec7190c7b992');


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
