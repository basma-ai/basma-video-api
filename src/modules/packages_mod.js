var global_vars = null;

const axios = require('axios');


module.exports = {

    init: function (new_global_vars) {

        global_vars = new_global_vars;


    },

    check_package_limit: async function (params) {


        // let params = {
        //     package_name: '',
        //     vendor_id: '',
        //     table_name: '',
        //     package_field: ''
        // };


        let package;
        // get the package
        await global_vars.knex('packages').where('name', params.package_name).then((rows) => {
            package = rows[0];
        });

        let table_count = 0;
        // get the count
        await global_vars.knex(params.table_name).where('vendor_id', params.vendor_id).where('is_deleted', false).then((rows) => {
            table_count = rows.count;
        });

        // check limits
        if(table_count >= package[params.package_field]) {
            return false;
        }

        return true;

    }


}
