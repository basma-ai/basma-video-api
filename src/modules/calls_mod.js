var global_vars = null;

const axios = require('axios');

let users_mod = require("../modules/users_mod");
let format_mod = require("../modules/format_mod");
let twilio_mod = require("../modules/twilio_mod");
var socket_mod = require("./socket_mod");

module.exports = {

    init: function (new_global_vars) {

        global_vars = new_global_vars;

        socket_mod.init(global_vars);


        users_mod.init(global_vars);
        format_mod.init(global_vars);
    },

    get_guest_call_refresh: async function (call_id, guest_id) {


        let success = true;
        let go_ahead = true;
        let return_data = {};


        // check the validity of the provided token
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
            await global_vars.knex('calls').select('*').where('id', '=', call_id).then((rows) => {
                if (rows[0] != null) {
                    the_call = rows[0];
                }
            });

            delete the_call['s3_recording_folder'];

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

                let vendor = await format_mod.get_vendor(the_call.vendor_id, true);

                // cool, we reached here, now let's initiate the call
                let update_data = {
                    last_refresh_time: Date.now()
                };

                if (the_call['connection_guest_token'] == null) {
                    // no token generated for the guest, let's make one
                    var twilio_guest_token = await twilio_mod.generate_twilio_token('guest-' + guest_id, 'call-' + the_call.id, vendor.recording_enabled);
                    // console.log("twilio_guest_token return is: ");
                    // console.log(twilio_guest_token);

                    let update_data = {
                        'twilio_guest_token': twilio_guest_token.token
                    };

                    if(twilio_guest_token.twilio_room_sid != null) {
                        update_data['twilio_room_sid'] = twilio_guest_token.twilio_room_sid;
                    }


                    // let's put it in the db
                    await global_vars.knex('calls').update({
                        'connection_guest_token': twilio_guest_token.token,
                        'twilio_room_sid': twilio_guest_token.twilio_room_sid,
                        'is_recorded': vendor.recording_enabled
                    }).where('id', '=', the_call.id);
                }


                var the_call = null;
                await global_vars.knex('calls').select('*').where('id', '=', call_id).then((rows) => {
                    if (rows[0] != null) {
                        the_call = rows[0];
                    }
                });
                return_data['call'] = await format_mod.format_call(the_call);

                delete return_data['call']['connection_agent_token'];

                await global_vars.knex('calls').where('id', '=', the_call.id).update(update_data).then((result) => {
                    success = true;
                });

                // get no of users in queue
                let queue_count = 0;
                await global_vars.knex('calls').count('id as total').where('id', '<', return_data['call']['id']).where('vendor_id', '=', return_data['call']['vendor_id']).where('status', '=', 'calling').then((result) => {
                    queue_count = result[0]['total'];
                    // console.log(result);
                });

                return_data['queue_count'] = queue_count;

                // get estimated wait time
                // get the average time  20 calls
                let average_call_duration = 0;
                await global_vars.knex('calls').avg('duration as average_duration')
                    .where('vendor_id', '=', return_data['call']['vendor_id'])
                    .whereNotNull('duration')
                    .where('duration', '<>', 0)
                    .limit(20)
                    .orderBy('id','DESC')
                    .then((result) => {
                        average_call_duration = result[0]['average_duration'];
                        // console.log(result);
                    });

                return_data['estimated_waiting_time'] = average_call_duration * queue_count;


            }
        }

        return return_data;

    },

    update_all_calls: async function (vendor_id) {

        // get all calls
        let calls = [];
        await global_vars.knex('calls').where('vendor_id', '=', vendor_id).where('status', '=', 'calling').then((rows) => {
            calls = rows;
        });

        for (let call of calls) {
            socket_mod.send_update({
                user_type: 'guest',
                user_id: call.guest_id,
                call_id: call.id,
                type: 'call_info',
                data: await this.get_guest_call_refresh(call.id, call.guest_id)
            });
        }

    },

    end_call_stuff: async function(call_id) {

        let the_call;
        await global_vars.knex('calls').where('id', '=', call_id).then((rows) => {
            the_call = rows[0];
        });

        // get the vendor of the call

        if(the_call.is_recorded) {
            console.log("recordings are enabled, trigger video processing service");

            await global_vars.knex('calls').where('id', '=', call_id).update({
                recording_status: 'pending'
            }).then((result) => {

            });


            // await axios.post(process.env.VIDEO_PROCESSING_API_URL+'/process_recording', {
            //     "twilio_sid": the_call.twilio_room_sid,
            //     "call_id": the_call.id,
            //     "password": process.env.VIDEO_PROCESSING_API_PASSWORD
            // }).then(function (result) {
            //
            // }).catch(function (err) {
            //     console.log("error getting recordings link");
            //     console.log(err);
            // });


        }






    },

    get_participants: async function(call_id) {

        let raw_call;
        await global_vars.knex('calls').where('id', '=', call_id).then((rows) => {
            raw_call = rows[0];
        });

        // agent user
        let agent_user = {
            user_type: 'vu',
            user_id: raw_call.vu_id
        }

        let guest_user = {
            user_type: 'guest',
            user_id: raw_call.guest_id
        }

        return [agent_user, guest_user]


    },

    generate_call: async function(params) {

        // let params = {
        //     vendor_id: 0,
        //     guest_id: 0,
        //     status: 0,
        //     vu_id: 0,
        //     vendor_service_id: 0
        // };

        let call_id = 0;

        params['creation_time'] = Date.now();
        await global_vars.knex('calls').insert(params).then((result) => {

            call_id = result[0];

        });

        return call_id;

    }


}
