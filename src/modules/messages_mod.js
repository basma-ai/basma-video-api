var global_vars = null;

const axios = require('axios');

let users_mod = require("../modules/users_mod");
let format_mod = require("../modules/format_mod");
let twilio_mod = require("../modules/twilio_mod");
var socket_mod = require("./socket_mod");
var calls_mod = require("./socket_mod");

module.exports = {

    init: function (new_global_vars) {

        global_vars = new_global_vars;

        socket_mod.init(global_vars);


        users_mod.init(global_vars);
        format_mod.init(global_vars);
        calls_mod.init(global_vars);

    },

    send_message: async function(params) {

        // let params = {
        //     user_type: 'guest',
        //     user_id: 335,
        //     message_type: 'text',
        //     value: 'hello there',
        //     call_id: 3532
        // };


        // insert it into the db
        let insert_data = {
            call_id: params.call_id,
            user_type: params.user_type,
            user_id: params.user_id,
            message_type: params.message_type,
            value: params.value,
            time: Date.now()
        }

        await global_vars.knex('messages').insert(insert_data).then((result) => {

        });

        // update all parties involved in that call via the socket connection
        let call_participants = await calls_mod.get_participants(params.call_id);

        for(let participant of call_participants) {

            await socket_mod.send_update({
                user_type: participant.user_type,
                user_id: participant.user_id,
                call_id: params.call_id,
                type: 'message',
                data: insert_data
            });


        }




    }


}
