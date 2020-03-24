var express = require('express');
var router = express.Router();
const crypto = require('crypto');
var users_mod = require("../modules/users_mod");
var log_mod = require("../modules/log_mod");
var global_vars;
var format_mod = require("../modules/format_mod");


// for test purposes
router.get('/log', function (req, res, next) {


    global_vars.knex.raw("SELECT VERSION()").then(
        (version) => console.log((version[0][0]))
    ).catch((err) => {
        console.log(err);
        throw err
    });

    res.send({
        "sample": "json"
    });
});


/**
 * @api {post} /vendor/logs/list List the log items
 * @apiName LogList
 * @apiGroup LogList
 * @apiDescription List log items
 *
 * @apiParam {String} access_token The access token.
 * @apiParam {Integer} [vu_id] The id of the vendor user which the log item belongs to.
 * @apiParam {String} [table_name] The name of the table.
 * @apiParam {Integer} [row_id] The row id
 * @apiParam {String} [type] The type: "create", "edit" or "delete"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK

 */
router.post('/vendor/logs/list', async function (req, res, next) {


    var success = true;
    var goAhead = true;
    var returnData = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');
    const vu = await format_mod.get_vu(vu_id, true);


    var log_rows;
    var get_log_rows = global_vars.knex.from('audit_log').select(['audit_log.*', 'vendors_users.name as user_name', 'vendors_users.username as user_username', 'vendors_users.role as user_role']).orderBy('id', 'DESC');

    // joining with user
    get_log_rows = get_log_rows.leftJoin('vendors_users', 'vendors_users.id', 'audit_log.vu_id');

    get_log_rows = get_log_rows.where('audit_log.vendor_id', '=', vu.vendor.id);

    // apply the filters
    if (req.body.table_name != null) {
        get_log_rows = get_log_rows.where('table_name', '=', req.body.table_name);
    }
    if (req.body.vu_id != null) {
        get_log_rows = get_log_rows.where('vu_id', '=', req.body.vu_id);
    }
    if (req.body.row_id != null) {
        get_log_rows = get_log_rows.where('row_id', '=', req.body.row_id);
    }
    if (req.body.type != null) {
        get_log_rows = get_log_rows.where('type', '=', req.body.type);
    }

    // if not admin and not mod, show only log entries belonging to the user the access_token provided belongs to
    if (!vu.role == 'admin') {
        get_log_rows = get_log_rows.where('vu_id', '=', vu.id);
    }

    if (req.body.per_page != null && req.body.page != null) {
        get_log_rows = get_log_rows.paginate({
            perPage: req.body.per_page == null ? 20 : req.body.per_page,
            currentPage: req.body.page == null ? 0 : req.body.page
        });
    }

    await get_log_rows.then((rows) => {
        log_rows = rows;
    }).catch((err) => {
        console.log(err);
        throw err
    });

    var log_rows_fixed = [];
    for (let log_row of (log_rows.data == null ? log_rows : log_rows.data)) {
        try {
            log_row.old_value = JSON.parse(log_row.old_value);
            log_row.new_value = JSON.parse(log_row.new_value);
            log_row.changed = JSON.parse(log_row.changed);

            log_row['user'] = {
                id: log_row.user_id,
                username: log_row.user_username,
                name: log_row.user_name,
                role: log_row.user_role
            };
            delete log_row.user_name;
            delete log_row.user_fullname;
            delete log_row.user_role;


        } catch (ex) {
            console.log(ex);
        }
        log_rows_fixed.push(log_row);
    }


    returnData['list'] = log_rows_fixed;
    returnData['pagination'] = log_rows.pagination;


    res.send({
        success: success,
        data: returnData
    });

});


module.exports = function (options) {

    global_vars = options;
    format_mod.init(global_vars);
    // users_mod.init(global_vars);

    return router;
};
