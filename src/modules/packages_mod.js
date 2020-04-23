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



        let table_count = 0;
        // get the count
        await global_vars.knex(params.table_name)
            .count('id as total')
            .where('vendor_id', params.vendor_id)
            .where('is_deleted', false)
            .then((rows) => {


            table_count = rows[0].total;


        });

        let shall_allow = false;
        // check limits
        if(table_count < package[params.package_field]) {
            shall_allow = true;
        }

        return {
            shall_allow: shall_allow,
            existing_count: table_count,
            limit: package[params.package_field]
        }

    }


}
