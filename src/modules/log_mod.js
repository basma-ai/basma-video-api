var global_vars = null;

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");


module.exports = {

    init: function (new_global_vars) {
        global_vars = new_global_vars;

        users_mod.init(global_vars);
        format_mod.init(global_vars);

    },

    log: async function (params) {

        // var pamas = {
        //     table_name: '',
        //     row_id: 0,
        //     vu_id: 0,
        //     old_value: '',
        //     new_value: '',
        //     type: '' // "create", "edit", "delete" or "view"
        // };

        //

        // ge the vendor id
        let vu = await format_mod.get_vu(params.vu_id, true);

        // console.log("the params are");
        // console.log(params);


        if (params.new_value != null) {
            params.new_value = JSON.parse(JSON.stringify(params.new_value));
        } else {
            params.new_value = {};
        }

        if (params.old_value == null) {


            // check if there's an old value

            var get_log_rows = global_vars.knex.from(params.table_name).select("*").where("id", "=", params.row_id);
            var old_row = {};
            await get_log_rows.then((rows) => {



                old_row = rows[0];
            }).catch((err) => {


                console.log(err);
                throw err
            });


            if (old_row != null) {
                params.old_value = old_row;
            }

        }
        if (params.old_value != null) {
            params.old_value = JSON.parse(JSON.stringify(params.old_value));
        }


        var changed = {};

        for (var key in params.new_value) {
            if (params.old_value[key] != null) {


                if (params.old_value[key] != params.new_value[key]) {
                    changed[key] = params.new_value[key];

                }


            }

            // add the user object
            if (key.includes('vu_id') || key == 'vu_id') {
                params.new_value[key.replace('vu_id', 'vu')] = await format_mod.get_vu(params.new_value[key]);
            }
        }

        for (var key in params.old_value) {
            // add the user object
            if (key.includes('vu_id') || key == 'vu_id') {
                params.old_value[key.replace('vu_id', 'vu')] = await format_mod.get_vu(params.old_value[key]);
            }
        }


        if (params.table_name == 'vendors_users') {
            var masked_pass_val = '*hidden*';
            if (params.old_value != null && params.old_value.password != null) {
                params.old_value.password = masked_pass_val;
            }
            if (params.new_value != null && params.new_value.password != null) {
                params.new_value.password = masked_pass_val;
            }
            if (changed != null && changed.password != null) {
                changed.password = masked_pass_val;
            }
        }


        await global_vars.knex('audit_log').insert({
            'table_name': params.table_name,
            'row_id': params.row_id,
            'vu_id': params.vu_id,
            'old_value': JSON.stringify(params.old_value),
            'new_value': JSON.stringify(params.new_value),
            'changed': JSON.stringify(changed),
            'type': params.type,
            'time': Date.now(),
            'vendor_id': vu.vendor.id
        }).then(function (result) {
            // console.log("log data inserted");
        }).catch((err) => {
            console.log(err);
            // throw err
        });

    }


}
