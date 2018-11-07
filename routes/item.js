var express = require('express');
var router = express.Router();

module.exports = function(emitter){

  router.get('/', function(req, res) {
    
    res.status(200).json({
      "version": "v2",
      "content": {
          "messages": [
              {
                 "type": "text",
                 "text": "simple text"    
              }
          ]
      }
  });

  });

  return router;
};

