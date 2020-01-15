const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = 1061
const setupPaginator = require('el7r-knex-paginator');


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
// var knex = require('knex')({
//   client: 'mysql2',
//   connection: {
//     host : 'aleecode-testing.cmh5u5ucbhrf.me-south-1.rds.amazonaws.com',
//     user : 'master',
//     password : 'q4IN3yUBbqFKzDgINbY7',
//     database : 'assets_system'
//   }
// });
var knex = require('knex')({
  client: 'mysql2',
  connection: {
    host : 'aleecode-testing.cmh5u5ucbhrf.me-south-1.rds.amazonaws.com',
    user : 'master',
    password : 'q4IN3yUBbqFKzDgINbY7',
    database : 'video_cc',
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
var guest = require('./routes/guest.js')(global_vars)
var calls = require('./routes/calls.js')(global_vars)

// guests
app.get('/guest', guest);
app.post('/guest/request_token', guest);

// calls
app.get('/calls', calls);
app.post('/calls/get_services', calls);
app.post('/calls/start_call', calls);
app.post('/calls/refresh_call', calls);
app.post('/calls/end_call', calls);


app.listen(port, () => console.log(`Video CC API listening on port ${port}!`))
