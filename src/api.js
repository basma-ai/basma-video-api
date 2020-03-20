const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = 1061
require('dotenv').config()
const { attachPaginate } = require('knex-paginate');


// set expressjs settings
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// establish database connection, using knex
var knex = require('knex')({
  client: 'mysql2',
  connection: {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
    insecureAuth: true
  },
  insecureAuth: true
});

attachPaginate();


// var global variables to pass
var global_vars = {
  knex: knex
};

// index page 
app.get('/', function(req, res) {
  res.send("You have reached the assets system API! well done! from api.js");
});

// require routes
let guest = require('./routes/guest.js')(global_vars)
let calls = require('./routes/calls.js')(global_vars)
let master = require('./routes/master.js')(global_vars)
let agent = require('./routes/agent.js')(global_vars)

let vendor = require('./routes/vendor.js')(global_vars)
let vendor_groups = require('./routes/vendor_groups.js')(global_vars)
let vendor_services = require('./routes/vendor_services.js')(global_vars)
let vendor_users = require('./routes/vendor_users.js')(global_vars)
let vendor_calls = require('./routes/vendor_calls.js')(global_vars)

// guests
app.get('/guest', guest);
app.post('/guest/request_token', guest);
app.post('/guest/get_vendor', guest);

// calls
app.get('/calls', calls);
app.post('/calls/get_services', calls);
app.post('/calls/start_call', calls);
app.post('/calls/refresh_call', calls);
app.post('/calls/end_call', calls);
app.post('/calls/submit_rating', calls);
app.post('/calls/test', calls);

// agent
app.get('/agent', agent);
app.post('/agent/request_token', agent);
app.post('/agent/list_pending_calls', agent);
app.post('/agent/answer_call', agent);
app.post('/agent/end_call', agent);
app.post('/agent/update_call', agent);

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
app.get('/services/groups', vendor_services);
app.post('/vendor/services/create', vendor_services);
app.post('/vendor/services/edit', vendor_services);
app.post('/vendor/services/list', vendor_services);
app.post('/vendor/services/get', vendor_services);

// vendors users
app.get('/services/users', vendor_users);
app.post('/vendor/users/create', vendor_users);
app.post('/vendor/users/edit', vendor_users);
app.post('/vendor/users/list', vendor_users);
app.post('/vendor/users/get', vendor_users);

// vendors calls
app.post('/vendor/calls/list', vendor_calls);
app.post('/vendor/calls/get', vendor_calls);

app.listen(port, () => console.log(`Video CC API listening on port ${port}!`))
