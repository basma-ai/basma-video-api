const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = 1041
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
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'assets_system',
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
var users = require('./routes/users.js')(global_vars)
var assets_categories = require('./routes/assets_categories.js')(global_vars)
var lists = require('./routes/lists.js')(global_vars)
var lists_items = require('./routes/lists_items.js')(global_vars)
var custom_fields = require('./routes/custom_fields.js')(global_vars)
var assets = require('./routes/assets.js')(global_vars)
var search = require('./routes/search.js')(global_vars)
var log = require('./routes/log.js')(global_vars)
var misc = require('./routes/misc.js')(global_vars)

// users
app.get('/users', users);
app.post('/users/create', users);
app.post('/users/list', users);
app.post('/users/request_access_token', users);
app.post('/users/edit', users);
app.post('/users/get', users);

// assets categories
app.get('/assets_categories', assets_categories);
app.post('/assets_categories/create', assets_categories);
app.post('/assets_categories/edit', assets_categories);
app.post('/assets_categories/delete', assets_categories);
app.post('/assets_categories/list', assets_categories);
app.post('/assets_categories/get', assets_categories);

// lists
app.get('/lists', lists);
app.post('/lists/create', lists);
app.post('/lists/edit', lists);
app.post('/lists/delete', lists);
app.post('/lists/list', lists);
app.post('/lists/get', lists);

// lists lists items
app.get('/lists_items', lists_items);
app.post('/lists_items/create', lists_items);
app.post('/lists_items/list', lists_items);
app.post('/lists_items/delete', lists_items);


// custom fields
app.get('/custom_fields', custom_fields);
app.post('/custom_fields/create', custom_fields);
app.post('/custom_fields/edit', custom_fields);
app.post('/custom_fields/get', custom_fields);
app.post('/custom_fields/delete', custom_fields);
app.post('/custom_fields/list', custom_fields);

// assets
app.get('/assets', assets);
app.post('/assets/create', assets);
app.post('/assets/edit', assets);
app.post('/assets/delete', assets);
app.post('/assets/get', assets);
app.post('/assets/list', assets);

// search
app.get('/search', search);
app.post('/search/search', search);

// logs
app.post('/log/list', log);

// misc
app.post('/misc/quick_stats', misc);




app.listen(port, () => console.log(`Assets API listening on port ${port}!`))
