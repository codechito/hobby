var express = require('express');
var router = express.Router();

module.exports = function(emitter){

  router.post('/register', function(req, res) {
    if(req.body.content && req.body.table){
      let content = req.body.content;
      let input = req.body.content.item.split("|");
      let item = {
        Name: input[0],
        Description: input[1],
        Phone: input[2],
        Meetup: input[3].split(","),
        Tags: input[4].split(","),
        Price: input[5],
        Photo: req.body.content.photo
      };
      
      var options = {
        table: req.body.table,
        content: item
      };
      let r = emitter.invokeHook("db::insertMany",options);
      r.then(function(content){
        res.status(200).json(content);
      },function(err){
        res.status(500).json({ error:err });
      })
    }
    else{
      res.status(500).json("No record found");
    }
    
  });
  
  router.post('/search', function(req, res) {
    
    if(req.body.content && req.body.table){
      let content = req.body.content;
      
      var options = {
        table: req.body.table,
        content: content
      };
      let r = emitter.invokeHook("db::find",options);
      r.then(function(content){
        let result = {
          "version": "v2",
          "content": {
              "messages": []
            }
        };
        let elements = {
          "type": "cards",
          "image_aspect_ratio": "square",
          "elements": []
        };
        content[0].forEach(function(item){
          elements.elements.push({
            "title": item.Name + " for only " + item.Price + ", Meet up " + item.Meetup,
            "subtitle": item.Description,
            "image_url": item.Photo
          });
        });
        
        result.content.messages.push(elements);
        
        res.status(200).json(result);
      },function(err){
        res.status(500).json({ error:err });
      })
    }
    else{
      res.status(500).json("No record found");
    }

  });

  return router;
};

