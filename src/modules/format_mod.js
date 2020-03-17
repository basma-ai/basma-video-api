var global_vars = null;

module.exports = {

    init: function(new_global_vars) {
        global_vars = new_global_vars;
    },

    get_vendor: async function(vendor_id) {

        let the_vendor = null;

        await global_vars.knex('vendors').select('*')
            .where('id','=',vendor_id).
            then((rows) => {
                the_vendor = rows[0];
            });

        return await this.format_vendor(the_vendor);

    },

    format_vendor: async function(vendor) {
      return vendor;
    },

    get_vu: async function(vu_id) { // friendly reminder, vu stands for vendor user

        let the_vu = null;

        await global_vars.knex('vendors_users').select('*')
            .where('id','=',vu_id).
            then((rows) => {
                the_vu = rows[0];
            });

        return await this.format_vu(the_vu);

    },

    format_vu: async function(vu) {

        if(vu == null) {
            return null;
        }

        delete vu['password'];
        delete vu['creation_time'];

        vu['vendor'] = await this.get_vendor(vu['vendor_id']);
        vu['photo_url'] = 'https://ui-avatars.com/api/?name='+encodeURIComponent(vu.name);
        delete vu['vendor_id'];

        return vu;
    },

    get_call: async function(id) { // friendly reminder, vu stands for vendor user

        let the_row = null;

        await global_vars.knex('calls').select('*')
            .where('id','=',id).
            then((rows) => {
                the_row = rows[0];
            });

        return await this.format_call(the_row);

    },
    format_call: async function(call) {
        call['vu'] = await this.get_vu(call['vu_id']);
        call['vendor_service'] = await this.get_vendor_service(call['vendor_service_id']);
        return call;
    },

    get_vendor_service: async function(id) {

        let the_row = null;

        await global_vars.knex('vendors_services').select('*')
            .where('id','=',id).
            then((rows) => {
                the_row = rows[0];
            });

        return await this.format_vendor_service(the_row);

    },
    format_vendor_service: async function(vendor_service) {
        return vendor_service;
    }


}
