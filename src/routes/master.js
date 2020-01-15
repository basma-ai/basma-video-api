let express = require('express');
let router = express.Router();

let users_mod = require("../modules/users_mod");

let global_vars;


// TOP SECRET: the master key
let master_secret = 'kj23@#4j23$@#K$L@34';


/**
 * @api {post} /master/create_vendor_user Create a vendor user
 * @apiName MasterCreateVendorUser
 * @apiGroup Master
 * @apiDescription Create a user for a vendor (agent, manager et al.)
 *
 * @apiParam {String} master_secret The secret, only you know it
 * @apiParam {Integer} vendor_id The vendor's ID
 * @apiParam {String} name Full name
 * @apiParam {String} role "agent" or "admin"
 * @apiParam {String} username The username
 * @apiParam {String} password The password
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/master/create_vendor_user', async function (req, res, next) {


    var success = false;
    var go_ahead = true;
    var return_data = {};


    // generate a token for our beloved guest
    // create a guest token

    if(req.body.master_secret != master_secret) {
        go_ahead = false;
    }

    if(go_ahead) {
        // check if username is taken
        await global_vars.knex('vendors_users').select('*').where('vendor_id', '=', req.body.vendor_id).where('username','=',req.body.username).then((rows) => {
            if(rows.length > 0) {
                if (return_data['errors'] == null) { return_data['errors'] = []; }
                return_data['errors'].push('username_taken');
                go_ahead = false;
            }
        });
    }

    if(go_ahead) {
        // define the data to be inserted

        var insert_data = {
            vendor_id: req.body.vendor_id,
            name: req.body.name,
            role: req.body.role,
            username: req.body.username,
            password: users_mod.encrypt_password(req.body.password),
            creation_time: Date.now()
        };

        // and now, do the insertion
        await global_vars.knex('vendors_users').insert(insert_data).then((result) => {
            console.log("done");
            success = true;
        });
    }

    res.send({
        success: success,
        data: return_data
    });

});




module.exports = function (options) {

    global_vars = options;
    users_mod.init(global_vars);

    return router;
};
