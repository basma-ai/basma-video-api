const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = 1061
const setupPaginator = require('el7r-knex-paginator');
require('dotenv').config()


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

setupPaginator(knex);


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
app.post('/calls/test', calls);

// agent
app.get('/agent', agent);
app.post('/agent/request_token', agent);
app.post('/agent/list_pending_calls', agent);
app.post('/agent/answer_call', agent);
app.post('/agent/end_call', agent);

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


app.listen(port, () => console.log(`Video CC API listening on port ${port}!`))
