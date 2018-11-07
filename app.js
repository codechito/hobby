var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var emitter = require('./core/hooks');
var mongo = require('./core/mongo')(emitter);
var item = require('./routes/item')(emitter);

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/assets",express.static(path.join(__dirname, 'public')));

app.use('/data', mongo);
app.use('/item', item);


module.exports = app;
