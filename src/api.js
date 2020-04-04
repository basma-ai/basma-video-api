const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = 1061
require('dotenv').config()
const {attachPaginate} = require('knex-paginate');
const socket_mod = require('./modules/socket_mod');

// set expressjs settings
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static('public'))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// establish database connection, using knex
var knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        insecureAuth: true
    },
    insecureAuth: true
});

attachPaginate();


// socket.io
const server = app.listen(port, () => console.log(`Video CC API listening on port ${port}!`))

var io = require('socket.io')(server);

// var global variables to pass
var global_vars = {
    knex: knex,
    socket_io: io
};

// init modules
socket_mod.init(global_vars);

// index page 
app.get('/', function (req, res) {
    res.send("You have reached the assets system API! well done! from api.js");
});

// require routes
let guest = require('./routes/guest.js')(global_vars)
let calls = require('./routes/calls.js')(global_vars)
let master = require('./routes/master.js')(global_vars)
let agent = require('./routes/agent.js')(global_vars)
// let files = require('./routes/files.js')(global_vars)

let vendor = require('./routes/vendor.js')(global_vars)
let vendor_groups = require('./routes/vendor_groups.js')(global_vars)
let vendor_services = require('./routes/vendor_services.js')(global_vars)
let vendor_users = require('./routes/vendor_users.js')(global_vars)
let vendor_calls = require('./routes/vendor_calls.js')(global_vars)
let vendor_custom_fields = require('./routes/vendor_custom_fields.js')(global_vars)
let vendor_logs = require('./routes/vendor_logs.js')(global_vars)
let vendor_roles = require('./routes/vendor_roles.js')(global_vars)
let vendor_permissions = require('./routes/vendor_permissions.js')(global_vars)
let vendor_reports = require('./routes/vendor_reports.js')(global_vars)

// guests
app.get('/guest', guest);
app.post('/guest/request_token', guest);
app.post('/guest/get_vendor', guest);

// calls
app.get('/calls', calls);
app.post('/calls/get_services', calls);
app.post('/calls/start_call', calls);
app.post('/calls/request_update', calls);
app.post('/calls/end_call', calls);
app.post('/calls/submit_rating', calls);
app.post('/calls/send_message', calls);
app.post('/calls/test', calls);

// agent
app.get('/agent', agent);
app.post('/agent/request_token', agent);
app.post('/agent/list_pending_calls', agent);
app.post('/agent/answer_call', agent);
app.post('/agent/end_call', agent);
app.post('/agent/update_call', agent);
app.post('/agent/send_message', agent);

// master
app.get('/master', master);
app.post('/master/create_vendor_user', master);

// vendors
app.get('/vendor', vendor);
app.post('/vendor/dashboard_numbers', vendor);
app.post('/vendor/calls_history', vendor);
app.post('/vendor/create_user', vendor);
app.post('/vendor/list_users', vendor);
app.post('/vendor/list_services', vendor);

// vendors groups
app.get('/vendor/groups', vendor_groups);
app.post('/vendor/groups/create', vendor_groups);
app.post('/vendor/groups/edit', vendor_groups);
app.post('/vendor/groups/list', vendor_groups);
app.post('/vendor/groups/get', vendor_groups);

// vendors services
app.post('/vendor/services/create', vendor_services);
app.post('/vendor/services/edit', vendor_services);
app.post('/vendor/services/list', vendor_services);
app.post('/vendor/services/get', vendor_services);

// vendors users
app.post('/vendor/users/create', vendor_users);
app.post('/vendor/users/edit', vendor_users);
app.post('/vendor/users/list', vendor_users);
app.post('/vendor/users/get', vendor_users);

// vendors calls
app.post('/vendor/calls/list', vendor_calls);
app.post('/vendor/calls/get', vendor_calls);
app.post('/vendor/calls/get_recording', vendor_calls);

// vendors users
app.post('/vendor/custom_fields/create', vendor_custom_fields);
app.post('/vendor/custom_fields/edit', vendor_custom_fields);
app.post('/vendor/custom_fields/list', vendor_custom_fields);
app.post('/vendor/custom_fields/get', vendor_custom_fields);

// vendors roles
app.post('/vendor/roles/create', vendor_roles);
app.post('/vendor/roles/edit', vendor_roles);
app.post('/vendor/roles/list', vendor_roles);
app.post('/vendor/roles/get', vendor_roles);

// vendors permissions
app.post('/vendor/permissions/list', vendor_permissions);

// vendors log
app.post('/vendor/logs/list', vendor_logs);

// vendors reports
app.post('/vendor/reports/calls', vendor_reports);



// files
// app.post('/files/get', files);
// app.post('/files/upload', files);

io.on('connection', function (socket) {
    console.log('a user connected with id:', socket.id);

    let id = socket.id;


    // iniating a socket by frontend
    socket.on('start_socket', function (data) {

        console.log("I am here");

        // let data = {
        //     user_type: "guest or agent",
        //     user_token: "the_token",
        //     call_id: "(optional)"
        // };

        try {
            data = JSON.parse(data);
        } catch(ex) {
            // console.log(ex);
        }
        data.socket_id = socket.id;
        socket_mod.start_socket(data);

        // calling knex and return

        // reply back with intervals of emit to client
        // io.to("ew47zhoK5zaX38pHAAAB").emit('call_refreshed', { hello: 'world' });
    });

    // check socket status, for testing purposes
    socket.on('check_status', async function (data) {

        let socket_ids = await socket_mod.get_socket_data(socket.id);

        for (let socket_id of socket_ids) {

            await socket_mod.send_update({
                user_type: socket_id.guest_id == null ? 'vu' : 'guest',
                user_id: socket_id.vu_id == null ? socket_id.guest_id : socket_id.vu_id,
                call_id: socket_id.call_id,
                data: {
                    hello: "hello there!!"
                }
            });

        }

    });

    socket.on('disconnect', async function () {

        console.log("disconnect triggered");

        await socket_mod.disconnect_socket(socket.id);

    });
});
