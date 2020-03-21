var express = require('express');
var router = express.Router();

var users_mod = require("../modules/users_mod");
var format_mod = require("../modules/format_mod");
var files_mod = require("../modules/files_mod");

var global_vars;

router.post('/files/get', async function (req, res, next) {

    
});

router.post('/files/upload', async function (req, res, next) {


});

module.exports = function (options) {
    global_vars = options;
    users_mod.init(global_vars);
    format_mod.init(global_vars);
    files_mod.init(global_vars);

    return router;
};
