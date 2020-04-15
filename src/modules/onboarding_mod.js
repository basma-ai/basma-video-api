var global_vars = null;

const axios = require('axios');

let users_mod = require("../modules/users_mod");
let format_mod = require("../modules/format_mod");
let twilio_mod = require("../modules/twilio_mod");
var socket_mod = require("./socket_mod");
var roles_mod = require("./roles_mod");

module.exports = {

    init: function (new_global_vars) {

        global_vars = new_global_vars;

        socket_mod.init(global_vars);


        users_mod.init(global_vars);
        format_mod.init(global_vars);
        roles_mod.init(global_vars);
    },

    create_vendor: async function(params) {



    }


}
