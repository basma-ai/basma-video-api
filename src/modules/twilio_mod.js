var AccessToken = require('twilio').jwt.AccessToken;
require('dotenv').config()
const axios = require('axios');

var global_vars = null;
// Substitute your Twilio AccountSid and ApiKey details
var ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
var API_KEY_SID = process.env.TWILIO_API_KEY_SID;
var API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;
var TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(ACCOUNT_SID, API_KEY_SECRET);
const client_master = require('twilio')(ACCOUNT_SID, TWILIO_AUTH_TOKEN);

module.exports = {

    init: function (new_global_vars) {
        global_vars = new_global_vars;
    },

    complete_room: function (room_name) {


        client_master.video.rooms(room_name)
            .update({status: 'completed'})
            .then(room => console.log(room.uniqueName + " completed"));

    },

    generate_twilio_room: async function (room_id, record = false) {

        let twilio_room_sid = null;

        // console.log("inside generate_twilio_token");
        await client_master.video.rooms.create({
            uniqueName: room_id,
            recordParticipantsOnConnect: record
        }).then(room => {
            console.log(room.sid)
            twilio_room_sid = room.sid;
            console.log("I am here inside video.rooms.create");
        }).catch(error => {
            console.log(error);
        });



        return {
            twilio_room_sid: twilio_room_sid
        };

    },

    generate_twilio_token: async function (client_id, room_id, record = false) {

        var VideoGrant = AccessToken.VideoGrant;

        // Create an Access Token
        var accessToken = new AccessToken(
            ACCOUNT_SID,
            API_KEY_SID,
            API_KEY_SECRET
        );

        // Set the Identity of this token
        accessToken.identity = client_id;

        // Grant access to Video
        var grant = new VideoGrant({
            recordParticipantsOnConnect: record
        });

        grant.room = room_id;
        accessToken.addGrant(grant);

        // Serialize the token as a JWT
        var jwt = accessToken.toJwt();
        // console.log(jwt);

        return {
            token: jwt
        };

    },

    get_recordings: async function (room_sid) {

        // console.log("the sid is: " + room_sid);


        let recordings = 'please wait';

        let room;
        await client_master.video.rooms(room_sid)
            .fetch()
            .then(new_room => {
                room = new_room
            }).catch(ex => {
                // console.log("exception");
                console.log(ex);
            });

        let recordings_link = room.links.recordings;
        // return recordings_link;
        
        let raw_recordings;
        await axios.get(recordings_link, {
            auth: {
                username: ACCOUNT_SID,
                password: TWILIO_AUTH_TOKEN
            }
        }).then(function (result) {
            raw_recordings = result.data.recordings;
        }).catch(function (err) {
            console.log("error getting recordings link");
            console.log(err);
        });

        let media_links = [];
        for(let raw_recording of raw_recordings) {
            media_links.push(raw_recording.links.media)
        }

        // await client_master.video.recordings(room_sid)
        //     .fetch()
        //     .then(recording => {
        //         recordings = recording;
        //     });

        return media_links;


    }


}
