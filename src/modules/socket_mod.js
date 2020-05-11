var global_vars = null;
let users_mod = require("../modules/users_mod");
let format_mod = require("../modules/format_mod");


module.exports = {

    init: function (new_global_vars) {
        global_vars = new_global_vars;
        users_mod.init(global_vars);
        format_mod.init(global_vars);
    },

    start_socket: async function (data) {

        let success = false;

        // sample data
        // let data = {
        //     user_type: "vu or guest",
        //     user_token: "the token",
        //     socket_id: 'idsj345jk43n5jk',
        //     user_id: 3434
        // };

        let insert_data = {
            socket_id: data.socket_id,
            time: Date.now(),
            call_id: data.call_id
        };

        let vu_id;
        let vendor_id;
        if (data.user_type == 'guest') {
            const guest_id = await users_mod.token_to_id('guests', data.user_token, 'id');
            insert_data['guest_id'] = guest_id;

            let guest = await format_mod.get_guest(guest_id);

            console.log("GOT THE GUEST 35234");
            console.log(guest);

            insert_data['vendor_id'] = guest['vendor_id'];


        } else if (data.user_type == 'vu') {
            vu_id = await users_mod.token_to_id('vendors_users_tokens', data.user_token, 'vu_id');
            insert_data['vu_id'] = vu_id;

            let vu = await format_mod.get_vu(vu_id, false);
            insert_data['vendor_id'] = vu['vendor_id'];

        }

        await global_vars.knex('sockets').insert(insert_data).then((result) => {
            success = true;
        });

        if (data.user_type == 'vu') {

            global_vars.calls_mod.get_agent_pending_calls({
                vu_id: vu_id,
                // services_ids: []
            }).then((pending_calls) => {
                // send them an updated calls list
                global_vars.socket_mod.send_update({
                    user_type: 'vu',
                    user_id: vu_id,
                    type: 'pending_list',
                    data: pending_calls
                });
            })

        }

        return success;

    },

    get_socket_ids: async function (type, id, call_id = null, vendor_id = null) {

        let stmnt = global_vars.knex('sockets').select('*');
        if (type == 'vu') {
            stmnt = stmnt.where('vu_id', '=', id);
        } else if (type == 'guest') {
            stmnt = stmnt.where('guest_id', '=', id);
        }

        if (call_id != null) {
            stmnt = stmnt.where('call_id', '=', call_id);
        }

        if (vendor_id != null) {
            stmnt = stmnt.where('vendor_id', '=', vendor_id);
        }

        let socket_ids = [];
        await stmnt.then((rows) => {
            for (let row of rows) {
                socket_ids.push(row.socket_id);
            }
        });

        return socket_ids;
    },

    get_socket_data: async function (socket_id) {

        let data;

        await global_vars.knex('sockets').where('socket_id', '=', socket_id).then((result) => {
            data = result;
        });

        return data;

    },

    send_update: async function (options) {
        // let options = {
        //     user_type, user_id, call_id, data, type
        // };


        // console.log("sending socket updates");
        // console.log(options);

        // get the sockets
        let sockets_ids = await this.get_socket_ids(options.user_type, options.user_id, options.call_id);

        for (let socket_id of sockets_ids) {
            global_vars.socket_io.to(socket_id).emit('on_update', {
                type: options.type,
                data: options.data
            });
        }


        // console.log(sockets_ids);
    },

    disconnect_socket: async function (socket_id) {

        console.log("in disconnect_socket");

        // get the call pending, if any
        let socket_datas = await this.get_socket_data(socket_id);

        for (let socket_data of socket_datas) {

            // console.log("the socket data");

            // console.log(socket_data);

            if (socket_data != undefined && socket_data['call_id'] != null) {
                await global_vars.knex('calls').where('id', '=', socket_data['call_id']).where('status', '=', 'calling').update({
                    status: 'missed',
                    missed_time: Date.now()
                });

                // console.log("in here 425435, the socket data is");
                // console.log(socket_data);

                let the_call = await format_mod.get_call(socket_data['call_id'], false);
                // console.log("the call is");
                // console.log(the_call);


                if (socket_data['vu_id'] != null) {
                    console.log("it's a vu");
                    await global_vars.knex('calls').where('id', '=', socket_data['call_id']).where('status', '=', 'started').update({
                        status: 'ended',
                        missed_time: Date.now()
                    });

                    the_call = await format_mod.get_call(socket_data['call_id'], false);


                    global_vars.socket_mod.send_update({
                        user_type: 'guest',
                        user_id: the_call.guest_id,
                        call_id: the_call.id,
                        type: 'call_info',
                        data: {
                            call: JSON.parse(JSON.stringify(the_call))
                        }
                    });

                    // console.log("socket data");
                    // console.log({
                    //     user_type: 'guest',
                    //     user_id: the_call.guest_id,
                    //     call_id: the_call.id,
                    //     type: 'call_info',
                    //     data: JSON.parse(JSON.stringify(the_call))
                    // });

                }


                if (the_call == null ||  the_call.vu == null || the_call.vu.id == null) {
                    // get all active agents of the vendor

                    console.log("I am here inside 34523523454");

                    let sockets22 = await this.get_socket_ids('vu', null, null, socket_data['vendor_id']);
                    for(let socket22 of sockets22) {

                        console.log("inside the socket");
                        console.log(JSON.stringify(socket22));

                        let socket22_data = await this.get_socket_data(socket22);
                        socket22_data = socket22_data[0];

                        global_vars.calls_mod.get_agent_pending_calls({
                            vu_id: socket22_data.vu_id,
                            // services_ids: [] // TODO add the services
                        }).then((pending_calls) => {
                            // send them an updated calls list
                            global_vars.socket_mod.send_update({
                                user_type: 'vu',
                                user_id: socket_data['vu_id'],
                                type: 'pending_list',
                                data: pending_calls
                            });

                        })

                    }

                } else {

                    global_vars.calls_mod.get_agent_pending_calls({
                        vu_id: the_call.vu.id,
                        // services_ids: []
                    }).then((pending_calls) => {
                        // send them an updated calls list
                        global_vars.socket_mod.send_update({
                            user_type: 'vu',
                            user_id: socket_data['vu_id'],
                            type: 'pending_list',
                            data: pending_calls
                        });

                    })
                }

                format_mod.get_call(the_call.id, true).then((call_info) => {

                    if(call_info.vu != null) {
                        global_vars.socket_mod.send_update({
                            user_type: 'vu',
                            user_id: call_info.vu.id,
                            call_id: call_info.id,
                            type: 'call_info',
                            data: call_info
                        })
                    }

                })


            }
        }

        await global_vars.knex('sockets').where('socket_id', '=', socket_id).delete();
    }


}
