var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var twilio_mod = require("../modules/twilio_mod");
const setupPaginator = require('el7r-knex-paginator');

var global_vars;



async function set_group_services(vu, group_id, services_ids) {


    console.log("service_ids is");
    console.log(services_ids);


    for(let service_id of services_ids) {


        // check if the relationships exists
        let exists = false;
        await global_vars.knex('groups_services_relations')
            .where('vendor_id', '=', vu.vendor.id)
            .where('group_id', '=', group_id)
            .where('service_id', '=', service_id).
            select('*').then((rows) => {
                if(rows.length > 0) {
                    exists = true;
                }
            }).then((result) => {
                console.log("result");
                console.log(result);
            }).catch((error) => {
                
                console.log("error");
                console.log(error);
                
            });


        // if doesn't exist, then add it
        if(!exists) {
            let insert_data = {
                service_id: service_id,
                group_id: group_id,
                vendor_id: vu.vendor.id
            }
            await global_vars.knex('groups_services_relations').insert(insert_data).then((result) => {
                console.log("groups_services_relations inserted");
            });
        }

    }

    // now let's delete the deleted ones
    await global_vars.knex('groups_services_relations')
        .where('vendor_id', '=', vu.vendor.id)
        .where('group_id', '=', group_id)
        .whereNotIn('service_id', services_ids)
        .delete();

}

/**
 * @api {post} /vendor/groups/create Create a group
 * @apiName VendorGroupsCreate
 * @apiGroup vendor
 * @apiDescription Create a group
 *
 * @apiParam {String} vu_token Vendor User Token
 * @apiParam {Integer} name Group name
 * @apiParam {Integer} services_ids An array of the IDs of the services to attach to the group
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK


 */
router.post('/vendor/groups/create', async function (req, res, next) {

    setupPaginator(global_vars.knex);

    let success = false;
    let go_ahead = true;
    let return_data = {};


    const vu_id = await users_mod.token_to_id('vendors_users_tokens', req.body.vu_token, 'vu_id');

    const vu = await format_mod.get_vu(vu_id, true);

    // check if admin
    if(vu.role == 'admin') {

        // that's awesome!, we can proceed with the process of creating an account for a new group as per the instructions and details provided by the vu (vendor user), the process will begin by by inserting the group in the database, then, you will be updated by another comment
        let insert_data = {
            vendor_id: vu.vendor.id,
            name: req.body.name
        };

        let group_id = 0;
        await global_vars.knex('groups').insert(insert_data).then((result) => {

            success = true;
            console.log("the result of group creation");
            console.log(result);
            group_id = result[0];

        }).catch((err) => {
            console.log("I am in the error");
            go_ahead = false;
        });

        if(go_ahead) {
            // cool, now let's assign the services
            await set_group_services(vu, group_id, req.body.service_ids);
        }

        return_data['group'] = await format_mod.get_group(group_id);

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

            console.log("I am here");

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



module.exports = function (options) {

    global_vars = options;
    users_mod.init(global_vars);
    format_mod.init(global_vars);

    return router;
};
