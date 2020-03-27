var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var log_mod = require("../modules/log_mod");
var roles_mod = require("../modules/roles_mod");

var global_vars;


/**
 * @api {post} /vendor/roles/list List a role
 * @apiName VendorGroupsList
 * @apiGroup vendor
 * @apiDescription List a role
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} per_page Records per page
 * @apiParam {Integer} page Page
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/permissions/list', async function (req, res, next) {

    let success = false;
    let go_ahead = true;
    let return_data = {};

    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if is_authenticated
    const is_authenticated = await roles_mod.is_authenticated(vu,[roles_mod.PERMISSIONS.ROLES]);

    if (is_authenticated) {

        let raw_permissions = [];
        let stmnt = global_vars.knex('permissions').select('*');

        await stmnt.then((rows) => {
            raw_permissions = rows;
            success = true;
        }).catch((err) => {
            go_ahead = false;
            console.log(err);
        });

        return_data['list'] = raw_permissions;

    } else {
        return_data['errors'] = ['unauthorized_action'];
    }

    res.send({
        success: success,
        data: return_data
    });

});

module.exports = function (options) {

    global_vars = options;
    users_mod.init(global_vars);
    format_mod.init(global_vars);
    log_mod.init(global_vars);
    roles_mod.init(global_vars);

    return router;
};
