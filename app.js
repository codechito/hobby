var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var emitter = require('psharky');
require('./core/facebook')(emitter);
var mongo = require('./core/mongo')(emitter);
var item = require('./routes/item')(emitter);

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/data', mongo);
app.use('/item', item);


let q = emitter.invokeHook("fb::request::accesstoken",{});

q.then(function(content){  
  let q = emitter.invokeHook("fb::post::create",{});
  q.then(function(content){  
  
    console.log("get token",content);
  },function(err){
    console.log("post create",err);
  });
},function(err){
  console.log("get token",err);
});


module.exports = app;
