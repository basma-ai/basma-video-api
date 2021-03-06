const crypto = require('crypto');

var global_vars = null;

module.exports = {

    init: function(new_global_vars) {
        global_vars = new_global_vars;
    },

    encrypt_password: function (password) {
        return crypto.createHash('sha256').update(password).digest('hex')+"b0l2h[$f@";
    },


    generate_token: async function(table_name) {


        var goAhead = true;
        var token;

        while (goAhead) {

            if (table_name == 'phone_verification_tokens' || table_name == 'vendors_phone_tokens') {
                return Math.floor(1000 + Math.random() * 9000);
            } else if (table_name == 'call_requests') {
                return Math.random().toString(36).substring(7);
            }


            // some random token
            token = crypto.createHash('sha256').update(Math.random().toString(36).substring(7)).digest('hex');

            var checkTokenStatement = global_vars.knex.from(table_name).select("*").where("token", "=", token);
            await checkTokenStatement.then((rows) => {
                if (rows[0] == null) {
                    // the token doesn't exist, this is great, now let's stop the loop.
                    goAhead = false;
                }
            }).catch((err) => {
                console.log(err);
                throw err
            });

        }

        return token;

    },
    create_token: async function(table_name, id_col_name = null, id_col_val = null) {
        var success = true;
        var token = await this.generate_token(table_name);


        var insert_data = {
            'token': token,
            'creation_time': Date.now()
        };

        if(id_col_name != null) {
            insert_data[id_col_name] = id_col_val;
        }

        await global_vars.knex(table_name).insert(insert_data).then(function (result) {
            // console.log("data inserted");
            // tokenId = result[0];

        })
            .catch((err) => {
                success = false;
                console.log(err);
                throw err
            });

        if (success) {
            return token;
        }

    },

    token_to_id: async function(table_name, token, col_name) {


        // get the token
        let the_result = null;
        await global_vars.knex(table_name).select('*').where('token','=',token).then((result) => {
            if(result.length > 0) {
                the_result = result[0];
            }
        });

        try {
            return the_result[col_name];
        } catch (e) {

        }

        return null;


    }



}
