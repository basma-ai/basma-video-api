var global_vars = null;

const axios = require('axios');

var AWS = require('aws-sdk');
// Set the region


module.exports = {

    init: function (new_global_vars) {

        global_vars = new_global_vars;


    },

    create_vendor: async function (params) {

        // data validity checks
        // -- check if the organization name is valid
        let go_ahead = true;

        await global_vars.knex('vendors').count('id as total').where('username', params.org_username).then((result) => {
            if(result[0]['total'] > 0) {
                go_ahead = false;
            }
        });
        if(!go_ahead) {
            return "org_username_taken";
        }

        if(go_ahead) {

            // let working_hours_template = '{"sunday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5c7","isOpen":true}],"monday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5d1","isOpen":true}],"tuesday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5d8","isOpen":true}],"wednesday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5df","isOpen":true}],"thursday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5e6","isOpen":true}],"friday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5ec","isOpen":true}],"saturday":[{"open":"0000","close":"1200","id":"5ca5578b0c5f8","isOpen":true}]}';

            let working_hours_template = '{"sunday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5c7","isOpen":true}],"monday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5d1","isOpen":true}],"tuesday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5d8","isOpen":true}],"wednesday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5df","isOpen":true}],"thursday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5e6","isOpen":true}],"friday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5ec","isOpen":true}],"saturday":[{"open":"24hrs","close":"24hrs","id":"5ca5578b0c5f8","isOpen":true}]}';

            let vendor_id = 0;

            // create the vendor
            await global_vars.knex('vendors').insert({
                name: params.org_name,
                username: params.org_username,
                working_hours: working_hours_template,
                recording_enabled: false,
                call_request_sms_template: 'Click at the link below to join the call: {link}',
                out_of_working_hours_message: 'We are closed right now',
                is_customer_view_enabled: true,
                phone_verified: false
            }).then((result) => {
                vendor_id = result;
            }).catch((err) => {
                global_vars.logger.error(err);
            });

            let vu_id = 0;
            if(vendor_id != 0) {
                // cool, the vendor now exists, let's create the user
                await global_vars.knex('vendors_users').insert({
                    vendor_id: vendor_id,
                    username: params.username,
                    name: params.name,
                    password: global_vars.users_mod.encrypt_password(params.password),
                    creation_time: Date.now(),
                    role: 'admin',
                    email: params.email,
                    is_deleted: false,
                    phone_number: params.phone_number
                }).then((result) => {
                    vu_id = result
                }).catch((err) => {

                });
            }

            let admin_role_id = 0;
            if(vu_id != 0) {
                // the vendor user is now created, we gotta create a role now
                await global_vars.knex('roles').insert({
                    vendor_id: vendor_id,
                    name: 'Admin'
                }).then((result) => {
                    admin_role_id = result
                }).catch((err) => {

                });
            }

            // add permissions to the admin_role
            await global_vars.knex('roles_permissions_relations').insert({
                vendor_id: vendor_id,
                role_id: admin_role_id,
                permission_id: 1 // superuser
            }).then().catch();

            // create an agent role
            let agent_role_id = 0;
            if(admin_role_id != 0) {
                // the vendor user is now created, we gotta create a role now
                await global_vars.knex('roles').insert({
                    vendor_id: vendor_id,
                    name: 'Agent'
                }).then((result) => {
                    agent_role_id = result
                }).catch((err) => {

                });
            }

            // add permissions to the agent_role
            let agent_perms = [2, 3, 15, 16];
            for(let agent_perm of agent_perms) {
                await global_vars.knex('roles_permissions_relations').insert({
                    vendor_id: vendor_id,
                    role_id: agent_role_id,
                    permission_id: agent_perm // superuser
                }).then().catch();
            }

            // add the admin role to the vu
            let done = false;
            if(admin_role_id != 0) {
                // the vendor user is now created, we gotta create a role now
                await global_vars.knex('vu_roles_relations').insert({
                    vendor_id: vendor_id,
                    vu_id: vu_id,
                    role_id: admin_role_id,
                    vendor_id: vendor_id
                }).then((result) => {
                    done = true
                }).catch((err) => {

                });
            }

            if(done) {

                // create and sms the phone verification token
                let token = await global_vars.users_mod.create_token('vendors_phone_tokens', 'vendor_id', vendor_id);

                // send sms
                await global_vars.notifs_mod.sendSMS(params.phone_number, `${token} is you verification pin`);

                let user = await global_vars.format_mod.get_vu(vu_id, true);

                try {
                    AWS.config.update({
                        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                        region: 'eu-west-1'
                    });

                    // send people@basma notification
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                'hello@basma.ai',
                            ]
                        },
                        Message: {
                            Body: {
                                Html: {
                                    Charset: "UTF-8",
                                    Data: `<h1>New registration</h1> 😀😍💪🏼 <br /> Org name: ${params.name} <br /> Email: ${params.email}<br /> Phone: ${params.phone_number}`
                                },
                                Text: {
                                    Charset: "UTF-8",
                                    Data: `New registration 😀😍💪🏼 ${params.name} - ${params.email}`
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: `New registration 😀😍💪🏼 ${params.name} - ${params.email}`
                            }
                        },
                        Source: 'hello@basma.ai', /* required */
                        ReplyToAddresses: [
                            'hello@basma.ai',
                            /* more items */
                        ],
                    };

                    var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
                    sendPromise.then(
                        function(data) {
                            // console.log(data.MessageId);
                        }).catch(
                        function(err) {
                            // console.error(err, err.stack);
                        });

                } catch(ex) {

                }

                return user;
            }

            return 'error';

        }




    }


}
