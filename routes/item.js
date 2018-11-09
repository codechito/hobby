var express = require('express');
var router = express.Router();

module.exports = function(emitter){

  router.post('/register/:PageId', function(req, res) {
    if(req.body.content && req.body.table){
      let content = req.body.content;
      let input = JSON.parse("[" +req.body.content.item[0] + "]");
      let item = {
        PageId:req.params.PageId,
        Photo: req.body.content.photo
      };
      input.forEach(function(element){
        for(var i in element){
          item[i] = element[i];
        }
      });
      
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
  
  router.post('/remove/:PageId', function(req, res){
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
              "_id": item._id,
              "PageId": req.params.PageId
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
  
  router.post('/rate/:PageId/:id', function(req, res) {
    if(req.body.table){
      let options = {
        table: req.body.table,
        content: {
          "_id": req.params.id,
          "PageId": req.params.PageId,
          "Raters": { "$nin": [req.body.UserId]}
        }
      };
      let q = emitter.invokeHook("db::find",options);
      q.then(function(content){  
        let item = content[0][0];
        if(item){
        
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
              "$inc": rating,
              "$push": { "Raters": req.body.UserId }
            }
          };
          let r = emitter.invokeHook("db::update",options);
          r.then(function(content){    
            res.status(200).json(content);
          },function(err){
            res.status(500).json({ error:err });
          });
        }
        else{
          res.status(500).json("Unable to rate, id not found or user already made a rate");
        }
      },function(err){
        res.status(500).json({ error:err });
      });
      
      
    }
    else{
      res.status(500).json("No record found");
    }
    
  });
  router.post('/validate/:PageId/:id', function(req, res) {
    if(req.body.table){
      let options = {
        table: req.body.table,
        content: {
          "_id": req.params.id,
          "PageId": req.params.PageId
        }
      };
      let r = emitter.invokeHook("db::find",options);
      r.then(function(content){    
        if(content[0].length){
          let item = content[0][0];
          let rate = 0;
          if(item.Prating && item.Visitor){
            rate = Math.round(((item.Prating/item.Visitor)*100)* 100)/100;
          }
          let result = {
            "version": "v2",
            "content": {
                "messages": [
                  {
                    "type": "cards",
                    "image_aspect_ratio": "square",
                    "elements": [
                      {
                        "title": "My Current Rating is " + rate + "%, please give me an honest rate ",
                        "subtitle": "Rating helps us improve our product/service to our beloved consumer",
                        "image_url": item.Photo,
                        "buttons": [
                          {
                            "type": "dynamic_block_callback",
                            "caption": "Happy",
                            "url": "https://codechito-hobby.glitch.me/item/rate/" + req.params.PageId + "/" + req.params.id,
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
                              "url": "https://codechito-hobby.glitch.me/item/rate/" + req.params.PageId + "/" + req.params.id,
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
  
  router.post('/search/:PageId', function(req, res) {
    
    if(req.body.content && req.body.table){
      let content = req.body.content;
      content.PageId = req.params.PageId;
      var options = {
        table: req.body.table,
        content: content,
        skip: req.body.skip||0,
        limit: req.body.limit||10
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
          let rate = 0;
          if(item.Prating && item.Visitor){
            rate = Math.round(((item.Prating/item.Visitor)*100)* 100)/100;
          }
          if(item.Photo){
            elements.elements.push({
              "title": item.Name + " for only " + item.Price + ",  Rating: " + rate + "%",
              "subtitle": item.Description,
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
                  "type": "flow",
                  "caption": "Rate Me",
                  "target": "content20181109041631_068607"
                }
              ]
            });  
          }
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
  
    router.post('/myItems/:PageId', function(req, res) {
    
    if(req.body.content && req.body.table){
      let content = req.body.content;
      content.PageId = req.params.PageId;
      var options = {
        table: req.body.table,
        content: content,
        skip: req.body.skip||0,
        limit: req.body.limit||10
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
          let rate = 0;
          if(item.Prating && item.Visitor){
            rate = Math.round(((item.Prating/item.Visitor)*100)* 100)/100;
          }
          elements.elements.push({
            "title": item.Name + " for only " + item.Price + ",  Rating: " + rate + "%",
            "subtitle": item.Description,
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

