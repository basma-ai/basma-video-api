var global_vars = null;

const axios = require('axios');


module.exports = {

    init: function (new_global_vars) {

        global_vars = new_global_vars;


    },

    check_package_limit: async function (params) {


        // let params = {
        //     package_id: '',
        //     vendor_id: '',
        //     table_name: '',
        //     package_field: ''
        // };


        let package;
        // get the package
        await global_vars.knex('packages').where('id', params.package_id).then((rows) => {
            package = rows[0];
        });

        let return_data = {};


        let table_count = null;
        // get the count
        if (params.table_name != null) {
            await global_vars.knex(params.table_name)
                .count('id as total')
                .where('vendor_id', params.vendor_id)
                .where('is_deleted', false)
                .then((rows) => {


                    table_count = rows[0].total;
                });
            return_data['existing_count'] = table_count
            return_data['limit'] = package[params.package_field];

        }

        let shall_allow = false;
        // check limits
        if (table_count < package[params.package_field]) {
            shall_allow = true;
        }

        return_data['shall_allow'] = shall_allow;

        if (params.table_name == null) {
            return_data['shall_allow'] = package[params.package_field] == 1 ? true : false
        }

        if(['chat', 'exchange_files', 'custom_fields'].includes(params.package_field)) {
            return_data['shall_allow'] = return_data['limit'] == 1 ? true : false
            return_data['limit'] = 0
        }


        return return_data;

    }


}
