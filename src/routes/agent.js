var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");

var global_vars;


/**
 * @api {post} /agent/request_token Request agent token (aka login)
 * @apiName AgentRequestToken
 * @apiGroup Agent
 * @apiDescription Request a token for an agent, or in simple English, login
 *
 * @apiParam {Integer} vendor_id Vendor ID
 * @apiParam {String} username Username
 * @apiParam {String} password Password
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "success": false,
    "data": {
        "token": "80f3120cfcfa5cc3982a8e9af6a581a452c0ee59d4fdd6a3275a0ef46ab8533b",
        "vu_user": {
            "id": 3,
            "username": "ali.bh",
            "name": "Ali Alnoaimi",
            "role": null,
            "vendor": {
                "id": 1,
                "name": "International Bank of Basma",
                "username": "ibb"
            }
        }
    }
}
 */
router.post('/agent/request_token', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    var the_vendor = null;
    await global_vars.knex('vendors').select('*').where('id','=',req.body.vendor_id).then((rows) => {
        if(rows[0] != null) {
            the_vendor = rows[0];
        }
    });

    if(the_vendor == null) {
        // no matching service found, halt
        if (return_data['errors'] == null) { return_data['errors'] = []; }
        return_data['errors'].push('invalid_vendor_id');
        go_ahead = false;
    }

    var the_vu = null; // friendly reminder, vu stands for vendor user, remember that so that you wouldn't get confused in the future.
    if(go_ahead) {
        // check the validity of the username and password

        await global_vars.knex('vendors_users').select('*')
            .where('username','=',req.body.username).
            where('password', '=', users_mod.encrypt_password(req.body.password)).
            then((rows) => {
                the_vu = rows[0];
        });

        if(the_vu == null) {
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('invalid_credentials');
            go_ahead = false;
        }


    }

    if(go_ahead) {
        //     create_token: async function(global_vars, table_name, id_col_name = null, id_col_val = null) {
        var token = await users_mod.create_token('vendors_users_tokens', 'vu_id', the_vu.id);
        return_data['token'] = token;
        return_data['vu_user'] = await format_mod.format_vu(the_vu);
    }

    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /agent/list_pending_calls List pending calls
 * @apiName AgentListPendingCalls
 * @apiGroup Agent
 * @apiDescription Get a list of the pending calls that the agent can answer
 *
 * @apiParam {String} [vu_token] VU stands for "vendor user", here put the vendor user's token, the one you got upon signin
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/agent/list_pending_calls', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    // check the validity of the provided token
    const vu_id = await users_mod.token_to_id( 'vendors_users_tokens', req.body.vu_token, 'vu_id');
    if(vu_id == null) {
        if (return_data['errors'] == null) { return_data['errors'] = []; }
        return_data['errors'].push('invalid_vu_token');
        go_ahead = false;
    }

    var the_vu = await format_mod.get_vu(vu_id);


    if(go_ahead) {
        // and now, do the insertion
        await global_vars.knex('calls').select('*').where('status', '=', 'calling').where('vendor_id', '=', the_vu.vendor.id).orderBy('creation_time','DESC').then((rows) => {
            return_data = rows;
        });
    }

    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /agent/answer_call Answer a call
 * @apiName AgentAnswerCall
 * @apiGroup Agent
 * @apiDescription Answer a call
 *
 * @apiParam {String} vu_token The access token of the agent
 * @apiParam {Integer} call_id The ID of the call
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "success": true,
    "data": {
    }
}
 * @apiErrorExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/agent/answer_call', async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    // check the validity of the provided token
    const vu_id = await users_mod.token_to_id( 'vendors_users_tokens', req.body.vu_token, 'vu_id');
    if(vu_id == null) {
        if (return_data['errors'] == null) { return_data['errors'] = []; }
        return_data['errors'].push('invalid_vu_token');
        go_ahead = false;
    }

    // var the_vu = await format_mod.get_vu(vu_id);


    if(go_ahead) {
        // get the call
        var the_call = null;
        await global_vars.knex('calls').select('*').where('id','=',req.body.call_id).then((rows) => {
            if(rows[0] != null) {
                the_call = rows[0];
            }
        });

        if(the_call == null) {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('invalid_call_id');
            go_ahead = false;
        }

        if(go_ahead && the_call.vu_id != null && the_call.vu_id != vu_id) {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('taken_by_another_agent');
            go_ahead = false;
        }

        if(go_ahead && the_call.status == 'ended') {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('call_ended');
            go_ahead = false;
        }

        if(go_ahead) {
            // cool, we reached here, now let's initiate the call
            let update_data = {
                vu_id: vu_id,
                status: 'started'
            };

            // return_data['call'] = the_call;

            await global_vars.knex('calls').where('id','=',the_call.id).update(update_data).then((result) => {
                success = true;
            });

            return_data['call'] = await format_mod.get_call(the_call.id);
        }
    }

    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /agent/end_call End a call
 * @apiName AgentEndCall
 * @apiGroup Agent
 * @apiDescription End a call
 *
 * @apiParam {String} vu_token The access token of the agent
 * @apiParam {Integer} call_id The ID of the call
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "success": true,
    "data": {
    }
}
 * @apiErrorExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/agent/end_call', async function (req, res, next) {


    let success = true;
    let go_ahead = true;
    let return_data = {};


    // check the validity of the provided token
    const vu_id = await users_mod.token_to_id( 'vendors_users_tokens', req.body.vu_token, 'vu_id');
    if(vu_id == null) {
        if (return_data['errors'] == null) { return_data['errors'] = []; }
        return_data['errors'].push('invalid_vu_token');
        go_ahead = false;
    }

    // var the_vu = await format_mod.get_vu(vu_id);


    if(go_ahead) {
        // get the call
        var the_call = null;
        await global_vars.knex('calls').select('*').where('id','=',req.body.call_id).then((rows) => {
            if(rows[0] != null) {
                the_call = rows[0];
            }
        });

        if(the_call == null) {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('invalid_call_id');
            go_ahead = false;
        }

        if(go_ahead && the_call.vu_id != vu_id) {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('unauthorized_acction');
            go_ahead = false;
        }

        if(go_ahead && the_call.status == 'ended') {
            // no matching service found, halt
            if (return_data['errors'] == null) { return_data['errors'] = []; }
            return_data['errors'].push('call_ended');
            go_ahead = false;
        }

        if(go_ahead) {
            // cool, we reached here, now let's initiate the call
            let update_data = {
                status: 'ended'
            };

            // return_data['call'] = the_call;

            await global_vars.knex('calls').where('id','=',the_call.id).update(update_data).then((result) => {
                success = true;
            });

            return_data['call'] = await format_mod.get_call(the_call.id);
        }
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

    return router;
};
