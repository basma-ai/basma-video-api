var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var twilio_mod = require("../modules/twilio_mod");
var log_mod = require("../modules/log_mod");

var global_vars;


router.post('/vendor/services/create', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin
    if (vu.role == 'admin') {

        let insert_data = {
            vendor_id: vu.vendor.id,
            name: req.body.name,
            is_restricted: req.body.is_restricted
        };


        let record_id = 0;
        await global_vars.knex('vendors_services').insert(insert_data).then((result) => {

            success = true;

            record_id = result[0];

        }).catch((err) => {
            go_ahead = false;
        });


        if (success) {
            let log_params = {
                table_name: 'vendors_services',
                row_id: record_id,
                vu_id: vu.id,
                new_value: insert_data,
                type: 'create'
            };


            log_mod.log(log_params);
        }

        return_data['service'] = await format_mod.get_vendor_service(record_id);

    } else {


        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /vendor/services/edit Edit a service
 * @apiName VendorServicesEdit
 * @apiGroup vendor
 * @apiDescription Edit a service
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} service_id Group ID
 * @apiParam {String} name Service name
 * @apiParam {Boolean} is_restricted Is Restricted?
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/services/edit', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin
    if (vu.role == 'admin') {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name,
            is_restricted: req.body.is_restricted
        };


        let log_params = {
            table_name: 'vendors_services',
            row_id: req.body.service_id,
            vu_id: vu.id,
            new_value: update_data,
            type: 'edit'
        };
        await log_mod.log(log_params);


        let group_id = 0;
        await global_vars.knex('vendors_services').update(update_data)
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.service_id)
            .then((result) => {

                success = true;

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });


    } else {
        return_data['errors'] = ['unauthorized_action'];
    }


    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /vendor/services/list List services
 * @apiName VendorServicesList
 * @apiGroup vendor
 * @apiDescription List services
 *
 * @apiParam {String} vu_token Vendor User Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/services/list', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin


    let raw_records = [];
    let stmnt;

    if (vu.role == 'admin') {
        stmnt = global_vars.knex('vendors_services')
            .where('vendor_id', '=', vu.vendor.id);
    } else {
        // get services which agent has access to
        stmnt = global_vars.knex('vendors_services')
            .select('vendors_services.*').distinct('vendors_services.id')
            .leftJoin('groups_services_relations', 'groups_services_relations.service_id', 'vendors_services.id')
            .leftJoin('groups', 'groups.id', 'groups_services_relations.group_id')
            .leftJoin('vu_groups_relations', 'vu_groups_relations.group_id', 'groups.id')
            .where(function () {
                this.where('vu_groups_relations.vu_id', '=', vu.id)
                    .orWhere('vendors_services.is_restricted', '=', false);
            }).andWhere('vendors_services.vendor_id', '=', vu.vendor.id)
            .orderBy('vendors_services.id', 'DESC');
    }

    if (req.body.per_page != null && req.body.page != null) {
        stmnt = stmnt.paginate({
            perPage: req.body.per_page == null ? 20 : req.body.per_page,
            currentPage: req.body.page == null ? 0 : req.body.page
        });
    }

    await stmnt.then((rows) => {

        raw_records = rows;
        success = true;

    }).catch((err) => {
        go_ahead = false;
        console.log(err);
    });

    let list = [];
    for (let raw_service of (raw_records.data == null ? raw_records : raw_records.data)) {
        list.push(await format_mod.format_vendor_service(raw_service));
    }

    return_data['list'] = list;
    return_data['pagination'] = raw_records.pagination;


    res.send({
        success: success,
        data: return_data
    });

});


/**
 * @api {post} /vendor/services/get Get a service
 * @apiName VendorServicesGet
 * @apiGroup vendor
 * @apiDescription Get a service
 *
 * @apiParam {String} vu_token Vendor User Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/services/get', async function (req, res, next) {


    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin
    if (vu.role == 'admin') {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name
        };

        let record;
        await global_vars.knex('vendors_services')
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.service_id)
            .then((rows) => {

                record = rows[0];

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });

        return_data['service'] = await format_mod.format_vendor_service(record);


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

    return router;
};
