var global_vars = null;

module.exports = {

    init: function (new_global_vars) {
        global_vars = new_global_vars;
    },

    get_vendor: async function (vendor_id, viewer = 'guest') {

        let the_vendor = null;

        await global_vars.knex('vendors').select('*')
            .where('id', '=', vendor_id).then((rows) => {
                the_vendor = rows[0];
            });

        return await this.format_vendor(the_vendor, viewer);

    },

    format_vendor: async function (vendor, viewer) {

        if (viewer != 'agent' && viewer != 'root') {
            delete vendor.recording_enabled;
            delete vendor.call_request_sms_template;
        }
        if (viewer != 'root') {
            Object.keys(vendor).filter((a) => {
                return a.startsWith('root_');
            }).forEach(e => delete vendor[e]);
        }

        if (viewer != 'root' && viewer != 'agent') {
            Object.keys(vendor).filter((a) => {
                return a.startsWith('private_');
            }).forEach(e => delete vendor[e]);
        }

        if (viewer != 'guest') {
            vendor['package'] = await this.get_package(vendor.package_id, 'vu');
        }

        if (viewer == 'guest') {
            // delete vendor.package_id
            // delete vendor.phone_verified
        }


        if (vendor.logo_url == null || vendor.logo_url == '') {
            vendor.logo_url = 'https://basma-cdn.s3.me-south-1.amazonaws.com/assets/logo-placeholder.png';
        }

        return vendor;
    },

    get_vu: async function (vu_id, full = true) { // friendly reminder, vu stands for vendor user

        let the_vu = null;

        await global_vars.knex('vendors_users').select('*')
            .where('id', '=', vu_id).then((rows) => {
                the_vu = rows[0];
            });

        return await this.format_vu(the_vu, full);

    },

    get_guest: async function (record_id, full = false) { // friendly reminder, vu stands for vendor user

        let the_record = null;

        await global_vars.knex('guests').select('*')
            .where('id', '=', record_id).then((rows) => {
                the_record = rows[0];
            });

        // console.log(the_record)

        if (full) {
            the_record['vendor'] = await this.get_vendor(the_record.vendor_id, 'guest')
        }


        return the_record;

    },

    format_vu: async function (vu, full = true) {

        if (vu == null) {
            return null;
        }

        vu['photo_url'] = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(vu.name);


        delete vu['password'];
        delete vu['creation_time'];

        if (full) {
            vu['vendor'] = await this.get_vendor(vu['vendor_id']);

            // delete vu['vendor_id'];

            // get groups
            let raw_groups = [];
            await global_vars.knex('vu_groups_relations')
                .select('groups.*')
                .where('vu_groups_relations.vendor_id', '=', vu.vendor.id)
                .where('vu_groups_relations.vu_id', '=', vu.id)
                .leftJoin('groups', 'groups.id', 'vu_groups_relations.group_id')
                .then((rows) => {
                    raw_groups = rows;
                })

            let groups = [];
            for (let raw_group of raw_groups) {
                groups.push(await this.format_group(raw_group, true));
            }
            vu['groups'] = groups;

            // get roles
            let raw_roles = [];
            await global_vars.knex('vu_roles_relations')
                .select('roles.*')
                .where('vu_roles_relations.vendor_id', '=', vu.vendor.id)
                .where('vu_roles_relations.vu_id', '=', vu.id)
                .leftJoin('roles', 'roles.id', 'vu_roles_relations.role_id')
                .then((rows) => {
                    raw_roles = rows;
                })

            let roles = [];
            for (let raw_role of raw_roles) {
                roles.push(await this.format_role(raw_role, true));
            }
            vu['roles'] = roles;
        }

        return vu;
    },

    get_call: async function (id, full = true, user = null) { // friendly reminder, vu stands for vendor user

        let the_row = null;

        await global_vars.knex('calls').select('*')
            .where('id', '=', id).then((rows) => {
                the_row = rows[0];
            });

        return await this.format_call(the_row, full, user);

    },
    format_call: async function (call, full = true, user = null) {

        // user = {type: vu/guest: user_id: int}

        call['vu'] = await this.get_vu(call['vu_id'], false);

        if (call['vendor_service_id'] != null) {
            call['vendor_service'] = await this.get_service(call['vendor_service_id']);
        }

        call['custom_fields_values'] = JSON.parse(call['custom_fields_values']);


        // get the list of participants

        let participants = [];
        if (user != null) {

            let partisStmnt = global_vars.knex('calls_participants')
                .where({
                    call_id: call.id
                });

            if(user == 'all') {

            } else {
                partisStmnt = partisStmnt.where({
                    user_type: user.user_type,
                    user_id: user.user_id
                });
            }

            await partisStmnt.then(async (rows) => {

                    for (let row of rows) {

                        let recToAdd = {
                            'info': row
                        };

                        if (row['user_type'] == 'guest') {

                            recToAdd['user'] = await this.get_guest(row['user_id'])


                        } else if (row['user_type'] == 'vu') {

                            recToAdd['user'] = await this.get_vu(row['user_id'], false);

                        }

                        participants.push(recToAdd);
                    }

                }).catch();
        }

        call['participants'] = participants;

        if (!full) {
            // delete call['connection_guest_token'];
            // delete call['connection_agent_token'];
            delete call['agent_notes'];
            delete call['twilio_room_sid'];
            delete call['s3_recording_folder'];
        }

        if (full) {
            // get rating
            let rating = 'no_rating';
            await global_vars.knex('ratings').where('call_id', '=', call.id).then((rows) => {
                if (rows.length > 0) {
                    rating = rows[0];
                }
            });
            call['rating'] = rating;

        }
        return call;
    },

    get_agent_call: async function (id, full = true) { // friendly reminder, vu stands for vendor user

        let the_row = null;

        await global_vars.knex('calls').select('*')
            .where('id', '=', id).then((rows) => {
                the_row = rows[0];
            });

        return await this.format_agent_call(the_row, full);

    },
    format_agent_call: async function (call, full = true) {
        call['vu'] = await this.get_vu(call['vu_id'], false);
        call['vendor_service'] = await this.get_service(call['vendor_service_id']);

        // if (!full) {
        delete call['connection_guest_token'];
        delete call['connection_agent_token'];
        // }
        return call;
    },

    get_service: async function (id) {

        let the_row = null;

        await global_vars.knex('services').select('*')
            .where('id', '=', id).then((rows) => {
                the_row = rows[0];
            });

        return await this.format_service(the_row);

    },
    format_service: async function (vendor_service) {
        try {
            delete vendor_service.is_deleted;
        } catch (e) {

        }

        return vendor_service;
    },

    get_permission: async function (id) {
        let the_row = null;

        await global_vars.knex('permissions').select('*')
            .where('id', '=', id).then((rows) => {
                the_row = rows[0];
            });

        return await this.format_permission(the_row);
    },
    format_permission: async function (permission) {
        return permission;
    },

    get_group: async function (id, full = true) {
        let the_row = null;

        await global_vars.knex('groups').select('*')
            .where('id', '=', id)
            .then((rows) => {
                the_row = rows[0];
            });

        return await this.format_group(the_row, full);
    },
    format_group: async function (the_row, full = true) {

        // get its services
        if (full) {
            the_row['services'] = [];
            if (the_row != null) {

                let services_raw = [];

                await global_vars.knex('groups_services_relations')
                    .select('*')
                    .where('vendor_id', '=', the_row.vendor_id)
                    .where('group_id', '=', the_row.id)
                    .orderBy('id', 'DESC').then((rows) => {
                        services_raw = rows;
                    });

                for (let service_raw of services_raw) {
                    the_row['services'].push(await this.get_service(service_raw.service_id));
                }
            }
        }

        delete the_row.is_deleted;

        return the_row;
    },

    get_role: async function (id, full = true) {
        let the_row = null;

        await global_vars.knex('roles').select('*')
            .where('id', '=', id)
            .then((rows) => {
                the_row = rows[0];
            });

        return await this.format_role(the_row, full);
    },
    format_role: async function (the_row, full = true) {


        // get its services
        if (full) {
            the_row['permissions'] = [];
            if (the_row != null) {

                let permissions_raw = [];

                await global_vars.knex('roles_permissions_relations')
                    .select('*')
                    .where('vendor_id', '=', the_row.vendor_id)
                    .where('role_id', '=', the_row.id)
                    .orderBy('id', 'DESC').then((rows) => {
                        permissions_raw = rows;
                    });

                for (let permission_raw of permissions_raw) {
                    the_row['permissions'].push(await this.get_permission(permission_raw.permission_id));
                }
            }
        }


        return the_row;
    },

    get_custom_field: async function (id) {

        let record = null;

        await global_vars.knex('custom_fields').select('*')
            .where('id', '=', id).then((rows) => {
                record = rows[0];
            });

        return await this.format_custom_field(record);

    },

    format_custom_field: async function (record) {

        if (record.type == 'checklist') {
            record.value = [];
        }

        return record;
    },


    get_call_request: async function (id) { // friendly reminder, vu stands for vendor user

        let the_row = null;

        await global_vars.knex('call_requests').select('*')
            .where('id', '=', id).then((rows) => {
                the_row = rows[0];
            });

        return await this.format_call_request(the_row);

    },
    format_call_request: async function (record, full = true) {
        record['vu'] = await this.get_vu(record['vu_id'], false);
        record['service'] = await this.get_service(record['service_id']);

        if (record['call_id'] != 0 && record['call_id'] != null) {
            try {
                record['call'] = await this.get_call(record['call_id'], false);
            } catch (e) {

            }
        } else {
            record['call'] = null
        }

        try {
            record['custom_fields_values'] = JSON.parse(record['custom_fields_values']);
        } catch (e) {

        }

        return record;
    },

    get_package: async function (id, viewer) { // friendly reminder, vu stands for vendor user

        let the_row = null;

        await global_vars.knex('packages').select('*')
            .where('id', '=', id).then((rows) => {
                the_row = rows[0];
            });

        return await this.format_package(the_row, viewer);

    },
    format_package: async function (record, viewer) {
        if (viewer != 'root') {
            delete record.stripe_annual_pan_id;
            delete record.stripe_monthly_plan_id;
        }
        return record;
    },

}
