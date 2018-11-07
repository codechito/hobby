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
        Link: input[6],
        UserId: input[7],
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
  
  router.post('/remove', function(req, res){
    if(req.body.content && req.body.table){
      let content = req.body.content;
      let options = {
        table: req.body.table,
        content: content
      };
      let r = emitter.invokeHook("db::find",options);
      r.then(function(result){
        let scontent = result[0];
        let rItem = [];
        if(scontent.length){
          scontent.forEach(function(item){
            rItem.push({
              "_id": item._id
            });
          });
          let nOptions = {
            table: req.body.table,
            content: rItem
          };
          console.log(JSON.stringify(nOptions));
          let r = emitter.invokeHook("db::remove::bulk",nOptions);
          r.then(function(result){
            res.status(200).json(result);

          },function(err){
            res.status(500).json({ error:err });
          });
        }
        else{
          res.status(500).json({ error:"No data found" });
        }
      },function(err){
        res.status(500).json({ error:err });
      });
        
    }
    else{
      res.status(500).json("No record found");
    }
  });
  
  router.post('/rate/:id', function(req, res) {
    if(req.body.table){
      let rating = {};
      if(req.body.positive){
        rating = { "Prating": 1, "Visitor": 1}
      }
      else{
        rating = { "Nrating": 1, "Visitor": 1}
      }
      let options = {
        table: req.body.table,
        content: {
          "_id":req.params.id,
      //    "UserId": { $ne: req.body.UserId },
          "$inc": rating
        }
      };
      console.log("chito",options);
      let r = emitter.invokeHook("db::update",options);
      r.then(function(content){    
        console.log("chito",content);
        res.status(200).json(content);
      },function(err){
        res.status(500).json({ error:err });
      });
    }
    else{
      res.status(500).json("No record found");
    }
    
  });
  router.post('/validate/:id', function(req, res) {
    if(req.body.table){
      let options = {
        table: req.body.table,
        content: {
          "_id":req.params.id
        }
      };
      let r = emitter.invokeHook("db::find",options);
      r.then(function(content){    
        if(content[0].length){
          let item = content[0][0];
          let result = {
            "version": "v2",
            "content": {
                "messages": [
                  {
                    "type": "cards",
                    "image_aspect_ratio": "square",
                    "elements": [
                      {
                        "title": "My Current Rating is " + Math.round(((item.Prating/item.Visitor)*100)* 100)/100 || 0 + "%, please give me an honest rate ",
                        "subtitle": "Rating helps us improve our product/service to our beloved consumer",
                        "image_url": item.Photo,
                        "buttons": [
                          {
                            "type": "dynamic_block_callback",
                            "caption": "Happy",
                            "url": "https://codechito-hobby.glitch.me/item/rate/" + req.params.id,
                            "method": "post",
                            "payload": {
                                "positive": true,
                                "table": "Item",
                                "UserId": req.body.UserId
                            }
                          },
                          {
                              "type": "dynamic_block_callback",
                              "caption": "Sad",
                              "url": "https://codechito-hobby.glitch.me/item/rate/" + req.params.id,
                              "method": "post",
                              "payload": {
                                  "positive": false,
                                  "table": "Item",
                                  "UserId": req.body.UserId
                              }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
          };
          res.status(200).json(result);
        }
        else{
          res.status(500).json("Code Error");
        }
        
      },function(err){
        console.log(err);
        res.status(500).json({ error:err });
      });
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
            "title": item.Name + " for only " + item.Price + ",  Rating: " + Math.round(((item.Prating/item.Visitor)*100)* 100)/100 || 0 + "%",
            "subtitle": item.Description + ", Meetup: " + item.Meetup,
            "image_url": item.Photo,
            "buttons": [
              {
                "type": "call",
                "caption": "Call Me",
                "phone": item.Phone
              },
              {
                "type": "url",
                "caption": "Chat Me",
                "url": "https://m.me/" + item.Link
              },
              {
                "type": "node",
                "caption": "Rate Me",
                "target": "RateMe"
              }
            ]
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

