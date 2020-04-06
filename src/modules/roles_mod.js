let format_mod = require("../modules/format_mod");


var global_vars = null;

module.exports = {

    PERMISSIONS: {
        SUPERUSER: "superuser",
        DASHBOARD: "dashboard",
        AGENT_PHONE: "agent_phone",
        CALLS_HISTORY: "calls_history",
        USERS: "users",
        GROUPS: "groups",
        ROLES: "roles",
        SERVICES: "services",
        CUSTOM_FIELDS: "custom_fields",
        AUDIT_LOG: "audit_log",
        SETTINGS: "settings",
        RECORDINGS: "recordings",
        REPORTS: "reports",
        BILLING: "billing",
        CALL_REQUESTS: "call_requests",
    },

    init: function(new_global_vars) {
        global_vars = new_global_vars;
        format_mod.init(global_vars);
    },

    is_authenticated: async function (vu, permission_names, object = null) {
        // return true;
        // console.log(permission_labels);
        let is_authenticated = false;
        let permissions_ids = [];
        let permissions = [];
        let relations_rows;

        if (object != null && object.hasOwnProperty("vendor_id") && vu.vendor.id != object.vendor_id) {
            return is_authenticated;
        }

        await global_vars.knex('vu_roles_relations')
            .where('vendor_id', '=', vu.vendor.id)
            .where('vu_id', '=', vu.id).then((rows) => {
                relations_rows = rows
            });

        // console.log(vu.id);
        // console.log(relations_rows);

        // loop thru user roles to get all permissions
        for (let relation of relations_rows) {

            await global_vars.knex('roles_permissions_relations')
                .select('*')
                .where('vendor_id', '=', relation.vendor_id)
                .where('role_id', '=', relation.role_id)
                .orderBy('id', 'DESC').then((rows) => {
                    permissions_ids = rows.map( permission => permission.permission_id);
                });

            // console.log(permissions_ids);

            for (let permission_id of permissions_ids) {
                const permission = await format_mod.get_permission(permission_id)
                if (permissions.indexOf(permission.name) === -1){
                    permissions.push(permission.name)
                    // console.log(permission.name);
                }
            }

            // check if have superuser permission
            if (permissions.indexOf(this.PERMISSIONS.SUPERUSER) > -1){
                return true
            }

            // check other permissions
            for (let permission_name of permission_names) {
                if (permissions.indexOf(permission_name) > -1) {
                    is_authenticated = true;
                    // console.log(permission_name + ":" + is_authenticated);
                }else{
                    is_authenticated = false;
                }
            }
        }

        return is_authenticated;
    },

}
