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


    console.log('start_call beginning')
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
        console.log('start_call inside go ahead')

        // get the service
        var the_service = null;
        await global_vars.knex('services').select('*').where('id', '=', req.body.service_id).then((rows) => {
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
            console.log('start_call inside go ahead 2')

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


            let new_call = await global_vars.calls_mod.generate_call(insert_data);
            console.log('start_call call generated')

            await global_vars.calls_mod.add_participant_to_call({
                vendor_id: the_service.vendor_id,
                call_id: new_call,
                user_type: 'guest',
                user_id: guest_id
            })


            return_data['call_id'] = new_call;

            if (new_call) {
                return_data['call_info'] = await calls_mod.get_guest_call_refresh(return_data['call_id'], guest_id);

                console.log('start_call call get_guest_call_refresh done')


                calls_mod.update_all_calls(the_service.vendor_id);

                console.log('start_call update_all_calls called')


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


    const guest_id = await users_mod.token_to_id('guests', req.body.guest_token, 'id')

    await socket_mod.send_update({
        user_type: 'guest',
        user_id: guest_id,
        call_id: return_data['call_id'],
        type: 'call_info',
        data: await calls_mod.get_guest_call_refresh(req.body.call_id, guest_id)
    })


    res.send({
        success: success,
        data: return_data
    })

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


            format_mod.get_call(the_call.id, true).then((call_info) => {
                socket_mod.send_update({
                    user_type: 'vu',
                    user_id: the_call.vu_id,
                    call_id: the_call.id,
                    type: 'call_info',
                    data: call_info
                })
            })


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


        // get cal participants
        let participants = await calls_mod.get_participants(the_call.id);

        if (go_ahead && !participants.some(a => (a.user_type == 'guest' && a.user_id == a.user_id))) {
            // no matching service found, halt
            if (return_data['errors'] == null) {
                return_data['errors'] = [];
            }
            return_data['errors'].push('unauthorized_action');
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

    // get all vendors
    let vendors;
    await global_vars.knex('vendors').then((rows) => {
        vendors = rows;
    });

    for (let vendor of vendors) {
        console.log("reached " + vendor.name);
        let vendor_id = vendor.id;

        let current_last_id = 0;
        // loop calls
        let calls;
        await global_vars.knex('calls')
            .where('vendor_id', vendor_id)
            .orderBy('id', 'ASC')
            .then((rows) => {
                calls = rows;
            });

        for (let call of calls) {
            console.log(`call ${call.id} of ${calls.length}`)
            current_last_id++;
            await global_vars.knex('calls')
                .where('vendor_id', vendor_id)
                .where('id', call.id)
                .update({
                    local_id: current_last_id
                })
                .then().catch();
        }
    }


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /calls/join Join a call
 * @apiName CallsJoin
 * @apiGroup Calls
 * @apiDescription Join a call given a call request token
 *
 * @apiParam {String} guest_token The access token of the guest
 * @apiParam {Integer} request_call_token The call token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/calls/join', async function (req, res, next) {


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

        if (go_ahead) {
            // cool, we reached here, now let's initiate the call
            // get the call_request

            // get the guest
            let guest_row;
            await global_vars.knex('guests').where('id', '=', guest_id).then((rows) => {

                guest_row = rows[0];

            });

            let call_request_id = 0;
            await global_vars.knex('call_requests').where('token', '=', req.body.request_call_token).then((rows) => {

                call_request_id = rows[0]['id'];

            });

            let call_request = await format_mod.get_call_request(call_request_id);

            let call_id;
            if (call_request.call_id == null || call_request.call_id == 0) {
                call_id = await calls_mod.generate_call({
                    status: call_request.make_it_ring ? 'waiting_for_agent' : 'waiting_for_agent_no_ring',
                    guest_id: guest_id,
                    vendor_service_id: call_request.service_id,
                    vendor_id: guest_row.vendor_id
                });

                await global_vars.calls_mod.add_participant_to_call({
                    vendor_id: call_request.vendor_id,
                    call_id: call_id,
                    user_type: 'guest',
                    user_id: guest_id
                })

                // update the request
                await global_vars.knex('call_requests').where('id', '=', call_request.id).update({
                    call_id: call_id
                });
            } else {
                call_id = call_request.call_id;
            }


            // update the request
            await global_vars.knex('call_requests').where('id', '=', call_request.id).update({
                guest_id: guest_id
            });

            // update the call
            await global_vars.knex('calls').where('id', '=', call_id).update({
                guest_id: guest_id,
                vendor_id: call_request.vendor_id
            });

            await global_vars.calls_mod.add_participant_to_call({
                call_id: call_id,
                user_type: 'guest',
                user_id: guest_id,
                vendor_id:  call_request.vendor_id
            })

            return_data['call_id'] = call_id;
            return_data['call_info'] = await calls_mod.get_guest_call_refresh(return_data['call_id'], guest_id);

            // get the call
            let call_data = await format_mod.get_call(return_data['call_id'], true);
            return_data['show_rating'] = call_data.rating.id != null ? false : true;

            return_data['call_info'] = await calls_mod.get_guest_call_refresh(return_data['call_id'], guest_id);

            calls_mod.update_all_calls(call_request.vendor_id);



        }
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
