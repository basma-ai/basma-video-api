var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");

var global_vars;


/**
 * @api {post} /guest/request_token Request a guest token
 * @apiName GuestRequestToken
 * @apiGroup Guest
 * @apiDescription Request an access token for a guest
 *
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


module.exports = function (options) {

    global_vars = options;
    users_mod.init(global_vars);

    return router;
};
