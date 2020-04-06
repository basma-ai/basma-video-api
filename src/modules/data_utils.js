let global_vars = null;

// let format_utils = require('./format_mod');

module.exports = {

    init: function(new_global_vars) {
        global_vars = new_global_vars;
        // format_utils.init(global_vars);
    },

    populate_data_obj: function(fields, data) {
        let the_return = {};

        for(let field of fields) {
            Object.keys(data).forEach(function(key) {
                if(key == field) {
                    let val = data[key];
                    the_return[key] = val;
                }
            });
        }

        return the_return;
    },



}
