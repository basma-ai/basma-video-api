var global_vars = null;

module.exports = {

    init: function (new_global_vars) {
        global_vars = new_global_vars;
    },

    get_vendor: async function (vendor_id) {

        let the_vendor = null;

        await global_vars.knex('vendors').select('*')
            .where('id', '=', vendor_id).then((rows) => {
                the_vendor = rows[0];
            });

        return await this.format_vendor(the_vendor);

    },

    format_vendor: async function (vendor) {
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

    format_vu: async function (vu, full = true) {

        if (vu == null) {
            return null;
        }

        vu['photo_url'] = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(vu.name);


        delete vu['password'];
        delete vu['creation_time'];

        if (full) {
            vu['vendor'] = await this.get_vendor(vu['vendor_id']);
            delete vu['vendor_id'];

            // get groups
            let raw_groups = [];
            await global_vars.knex('vu_groups_relations')
                .where('vendor_id', '=', vu.vendor.id)
                .where('vu_id', '=', vu.id)
                .then((rows) => {
                    raw_groups = rows;
                })

            let groups = [];
            for (let raw_group of raw_groups) {
                    groups.push(await this.format_group(raw_group, true));
            }
            vu['groups'] = groups;


        }



        return vu;
    },

    get_call: async function (id) { // friendly reminder, vu stands for vendor user

        let the_row = null;

        await global_vars.knex('calls').select('*')
            .where('id', '=', id).then((rows) => {
                the_row = rows[0];
            });

        return await this.format_call(the_row);

    },
    format_call: async function (call, full = true) {
        call['vu'] = await this.get_vu(call['vu_id'], false);
        call['vendor_service'] = await this.get_vendor_service(call['vendor_service_id']);

        if (!full) {
            delete call['connection_guest_token'];
            delete call['connection_agent_token'];
        }
        return call;
    },

    get_vendor_service: async function (id) {

        let the_row = null;

        await global_vars.knex('vendors_services').select('*')
            .where('id', '=', id).then((rows) => {
                the_row = rows[0];
            });

        return await this.format_vendor_service(the_row);

    },
    format_vendor_service: async function (vendor_service) {
        return vendor_service;
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
        if(full) {
            the_row['services'] = [];
            if (the_row != null) {

                let services_raw = [];

                await global_vars.knex('groups_services_relations')
                    .select('*')
                    .where('vendor_id', '=', the_row.vendor_id)
                    .where('group_id', '=', the_row.id)
                    .orderBy('id', 'DESC').then((rows) => {
                        services_raw = rows;

                        console.log(rows);

                    });

                for (let service_raw of services_raw) {
                    the_row['services'].push(await this.get_vendor_service(service_raw.service_id));
                }
            }
        }


        return the_row;
    },


}
