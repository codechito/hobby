var express = require('express');
var router = express.Router();

module.exports = function(emitter){

  router.get('/', function(req, res) {
    
    res.status(200).json({
      "version": "v2",
      "content": {
          "messages": [
            {
              "type": "cards",
              "elements": 
              [
                {
                  "title": "Card title",
                  "subtitle": "card text",
                  "image_url": "https://manybot-thumbnails.s3.eu-central-1.amazonaws.com/ca/xxxxxxzzzzzzzzz.png"  
                },
                {
                  "title": "Card title",
                  "subtitle": "card text",
                  "image_url": "https://manybot-thumbnails.s3.eu-central-1.amazonaws.com/ca/xxxxxxzzzzzzzzz.png"  
                },
                {
                  "title": "Card title",
                  "subtitle": "card text",
                  "image_url": "https://manybot-thumbnails.s3.eu-central-1.amazonaws.com/ca/xxxxxxzzzzzzzzz.png"  
                },
                {
                  "title": "Card title",
                  "subtitle": "card text",
                  "image_url": "https://manybot-thumbnails.s3.eu-central-1.amazonaws.com/ca/xxxxxxzzzzzzzzz.png"  
                },
                {
                  "title": "Card title",
                  "subtitle": "card text",
                  "image_url": "https://manybot-thumbnails.s3.eu-central-1.amazonaws.com/ca/xxxxxxzzzzzzzzz.png"  
                }
              ]
             }   
          ]
      }
  });

  });

  return router;
};

