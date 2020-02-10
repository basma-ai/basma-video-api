var AccessToken = require('twilio').jwt.AccessToken;
require('dotenv').config()

var global_vars = null;

module.exports = {

    init: function (new_global_vars) {
        global_vars = new_global_vars;
    },

    generate_twilio_token: function (client_id, room_id) {

        var VideoGrant = AccessToken.VideoGrant;

        // Substitute your Twilio AccountSid and ApiKey details
        var ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
        var API_KEY_SID = process.env.TWILIO_API_KEY_SID;
        var API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;

        // Create an Access Token
        var accessToken = new AccessToken(
            ACCOUNT_SID,
            API_KEY_SID,
            API_KEY_SECRET
        );

        // Set the Identity of this token
        accessToken.identity = client_id;

        // Grant access to Video
        var grant = new VideoGrant();
        grant.room = room_id;
        accessToken.addGrant(grant);

        // Serialize the token as a JWT
        var jwt = accessToken.toJwt();
        // console.log(jwt);

        return jwt;

    },


}
