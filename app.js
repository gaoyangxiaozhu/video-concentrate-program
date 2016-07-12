/**
 * Main application file
 */

'use strict';

var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();
var server = require('http').createServer(app);

var compression = require('compression');
var bodyParser = require('body-parser');
var multer = require('multer');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var path = require('path');
var session = require('express-session');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
    secret: 'gyycoder',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

app.get('/', function(req, res, next){
    res.render('index');
});
require('./routes')(app);
//Start server
server.listen(8000, function () {
  console.log('Express server listening on 80');
});

exports = module.exports = app;
