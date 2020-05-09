let global_vars = null;

module.exports = {

    init: function(new_global_vars) {
        global_vars = new_global_vars;
        // format_utils.init(global_vars);
    },

    auth_vu: function() {
        return function(req, res, next) {
            if (req.body.vu_token == 'invalid') res.send("invalid vu token");
            else next();
        }
    },



}
