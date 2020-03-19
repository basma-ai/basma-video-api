var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var twilio_mod = require("../modules/twilio_mod");
const setupPaginator = require('el7r-knex-paginator');

var global_vars;



router.post('/vendor/services/create', async function (req, res, next) {

    setupPaginator(global_vars.knex);

    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin
    if(vu.role == 'admin') {

        let insert_data = {
            vendor_id: vu.vendor.id,
            service_name: req.body.name
        };

        let record_id = 0;
        await global_vars.knex('vendors_services').insert(insert_data).then((result) => {

            success = true;
            console.log("the result of service creation");
            console.log(result);
            record_id = result[0];

        }).catch((err) => {
            go_ahead = false;
        });

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
 * @api {post} /vendor/groups/edit Edit a group
 * @apiName VendorGroupsEdit
 * @apiGroup vendor
 * @apiDescription Edit a group
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} group_id Group ID
 * @apiParam {String} name Group name
 * @apiParam {Integer} services_ids An array of the IDs of the services to attach to the group
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/groups/edit', async function (req, res, next) {

    setupPaginator(global_vars.knex);

    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin
    if(vu.role == 'admin') {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name
        };

        let group_id = 0;
        await global_vars.knex('groups').update(update_data)
            .where('vendor_id', '=', vu.vendor.id)
            .where('id', '=', req.body.group_id)
            .then((result) => {

                success = true;

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });

        if(go_ahead) {

            // cool, now let's assign the services
            await set_group_services(vu, req.body.group_id, req.body.service_ids);

        }
    } else {
        return_data['errors'] = ['unauthorized_action'];
    }




    res.send({
        success: success,
        data: return_data
    });

});

/**
 * @api {post} /vendor/groups/list List a group
 * @apiName VendorGroupsList
 * @apiGroup vendor
 * @apiDescription List a group
 *
 * @apiParam {String} vu_token Vendor User Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/groups/list', async function (req, res, next) {

    setupPaginator(global_vars.knex);

    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin
    if(vu.role == 'admin') {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let update_data = {
            name: req.body.name
        };

        let raw_groups = [];
        await global_vars.knex('groups')
            .where('vendor_id', '=', vu.vendor.id)
            .then((rows) => {

                raw_groups = rows;

            }).catch((err) => {
                go_ahead = false;
                console.log(err);
            });

        let groups = [];
        for(let raw_group of raw_groups) {
            groups.push(await format_mod.format_group(raw_group));
        }

        return_data['groups'] = groups;


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

    return router;
};
