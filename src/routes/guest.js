var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");

var global_vars;


/**
 * @api {post} /guest/request_token Request a guest token
 * @apiName GuestRequestToken
 * @apiGroup Guest
 * @apiDescription Request an access token for a guest
 *
 * @apiParam name Name
 * @apiParam phone Phone
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "success": true,
    "data": {
        "token": "cf6dc255705a657763b1ec632276e9ed5684511cc8089c2061bdd5a6f71776ce"
    }
}
 */
router.post('/guest/request_token', async function (req, res, next) {


    var success = false;
    var goAhead = true;
    var return_data = {};


    // generate a token for our beloved guest
    // create a guest token

    var token = await users_mod.generate_token('guests');

    // get the user agent & IP
    var user_agent = req.headers['user-agent'];
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // define the data to be inserted
    var insert_data = {
        token: token,
        user_agent: user_agent,
        ip: ip,
        name: req.body.name,
        phone: req.body.phone,
        creation_time: Date.now()
    };

    // and now, do the insertion
    await global_vars.knex('guests').insert(insert_data).then((result) => {
        return_data['token'] = token;
        success = true;
    });

    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /guest/get_vendor Get vendor profile
 * @apiName GuestGetVendor
 * @apiGroup Guest
 * @apiDescription Get a vendor's profile
 *
 * @apiParam {Integer} vendor_id The ID of the vendor
 * @apiParam {Integer} vendor_username The Username of the vendor
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "success": true,
    "data": {
        "vendor": {
            "id": 1,
            "name": "International Bank of Basma",
            "username": "ibb",
            "logo_url": "https://i.imgur.com/o2H9D9f.png"
        }
    }
}
 */
router.post('/guest/get_vendor', async function (req, res, next) {


    var success = false;
    var goAhead = true;
    var return_data = {};


    // generate a token for our beloved guest
    // create a guest token


    if(req.body.vendor_username != null) {
        let the_vendor = null;

        await global_vars.knex('vendors').select('*')
            .where('username','=',req.body.vendor_username).
            then((rows) => {
                the_vendor = rows[0];
            });

        req.body.vendor_id = the_vendor['id'];
    }

    let vendor = await format_mod.get_vendor(req.body.vendor_id);

    success = true;
    return_data['vendor'] = vendor;

    res.send({
        success: success,
        data: return_data
    });

});


module.exports = function (options) {

    global_vars = options;
    users_mod.init(global_vars);
    format_mod.init(global_vars);

    return router;
};
