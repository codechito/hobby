var FB = require('fb');
var config = require("config");

module.exports = chito = function(emitter){
  emitter._accesstoken; false;
  emitter.registerHook('fb::request::accesstoken',function(options){
         
    return new Promise(function(resolve,reject){
      
      FB.api('oauth/access_token', {
        client_id: config.AppID,
        client_secret: config.AppSecret,
        grant_type: 'client_credentials'
      }, function (res) {
          if(!res || res.error) {
              reject(!res ? 'error occurred' : res.error);
          }
          emitter._accesstoken = res.access_token;
          FB.setAccessToken(res.access_token);
          resolve(res.access_token);
      });

    });

  });

  emitter.registerHook('fb::post::create',function(options){
         
    return new Promise(function(resolve,reject){
      FB.api('492706524552445/feed', 'post', { 
        message: "Hello world", 
        picture: "https://www.cicis.com/media/1138/pizza_trad_pepperoni.png",
        link: "https://codechito.github.io/hobby/"
      }, function (res) {
        if(!res || res.error) {
          console.log(!res ? 'error occurred' : res.error);
          return;
        }
        console.log('Post Id: ' + res.id);
      });
    });

  });

};

