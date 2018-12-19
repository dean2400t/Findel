require ('express-async-errors');
const winston = require('winston');
var express = require('express');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var app = express();
global.__basedir = __dirname;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());


require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/prod")(app);

const port=process.env.port || 3010;
app.listen(port, ()=>winston.info(`Listening on port ${port}...`));
module.exports = app;
