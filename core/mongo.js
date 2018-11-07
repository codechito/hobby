const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const config = require("config");

var connection = mongoose.createConnection(config.mongodburl,{useNewUrlParser: true});

const ItemSchema = {
  "UserId": { type: String },
  "Type": { type: String },
  "Name": { type: String, required: true },
  "Description": { type: String },
  "Photo": { type: String },
  "Link": { type: String },
  "Phone": { type: String },
  "Rating": { type: String },
  "Tags":{ type: [String] },
  "Meetup": { type: [String] },
  "Price": { type: [String] },
  "entry": { type: Date, default: Date.now },
  "status": { type: Boolean, default: true }
};

var item = connection.model('Item',new Schema(ItemSchema,{collection: 'Item',versionKey: false}));

var db = {
  Item: item
};

module.exports = function(emitter){

  emitter.registerHook('db::create',function(options){
         
    return new Promise(function(resolve,reject){
      if(db[options.table]){
        db[options.table].create(options.content,function(err,result){
          if(err){
            reject(err);
          }
          if(result){
            resolve(result);
          }
        });
      }
      else{
        reject("TABLE_NOT_FOUND");
      }
    });

  });

  emitter.registerHook('db::find',function(options){
         
    return new Promise(function(resolve,reject){
      if(db[options.table]){
        if(options.content._id){
          options.content._id = ObjectId(options.content._id);
        }
        db[options.table]
          .find(options.content)
          .skip(options.skip || 0)
          .limit(options.limit || 100)
          .sort(options.sort || {})
          .exec(function(err,result){
            if(err){
              reject(err);
            }
            if(result){
              resolve(result);
            }
          });
      }
      else{
        reject("TABLE_NOT_FOUND");
      }
    });

  });

  emitter.registerHook('db::update',function(options){
         
    return new Promise(function(resolve,reject){
      if(db[options.table]){
        let item = JSON.parse(JSON.stringify(options.content));
        delete item._id;
        db[options.table]
          .updateOne({"_id" : ObjectId(options.content._id)},{$set:item},{multi: true},function(err,result){
            if(err){
              reject(err);
            }
            if(result){
              resolve(result);
            }
          });
      }
      else{
        reject("TABLE_NOT_FOUND");
      }
    });

  });

  emitter.registerHook('db::update::bulk',function(options){
         
    return new Promise(function(resolve,reject){
      if(db[options.table]){
        var Bulk = db[options.table].collection.initializeUnorderedBulkOp();
        options.content.forEach(function(content){
          let item = JSON.parse(JSON.stringify(content));
          delete item._id;
          Bulk.find({ "_id": ObjectId(content._id) })
              .update({
                "$set": item
              });
        })
        Bulk.execute(function(err,result){
          if(err){
            reject(err);
          }
          if(result){
            resolve(result);
          }
        });
      }
      else{
        reject("TABLE_NOT_FOUND");
      }
    });

  });

  emitter.registerHook('db::remove::bulk',function(options){
         
    return new Promise(function(resolve,reject){
      if(db[options.table]){
        var Bulk = db[options.table].collection.initializeUnorderedBulkOp();
        options.content.forEach(function(content){
          Bulk.find({ "_id": content._id })
              .remove();
        })
        Bulk.execute(function(err,result){
          if(err){
            console.log(err);
            reject(err);
          }
          if(result){
            resolve(result);
          }
        });
      }
      else{
        reject("TABLE_NOT_FOUND");
      }
    });

  });

  emitter.registerHook('db::insertMany',function(options){
         
    return new Promise(function(resolve,reject){
      if(db[options.table]){
        db[options.table].insertMany(options.content,function(err,result){
          if(err){
            reject(err);
          }
          if(result){
            resolve(result);
          }
        });
      }
      else{
        reject("TABLE_NOT_FOUND");
      }
    });

  });

  router.get('/', function(req, res) {
    let content = {};
    if(req.query.content){
      content = req.query.content;
    }
    var options = {
      table: req.query.table,
      content: content,
      limit: req.query.limit,
      skip: req.query.skip,
      sort: req.query.sort || {}
    };

    let r = emitter.invokeHook("db::find",options);

    r.then(function(content){
      res.status(200).json(content);
    },function(err){
      res.status(500).json({ error:err });
    });

  });

  router.post('/', function(req, res) {
    if(req.body.content){
      let content = req.body.content;
      var options = {
        table: req.body.table,
        content: content
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

  router.put('/', function(req, res) {
    if(req.body.content){
      let content = req.body.content;
      var options = {
        table: req.body.table,
        content: content
      };
      let r = emitter.invokeHook("db::update::bulk",options);
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

  router.delete('/', function(req, res) {
    if(req.body.content){
      let content = req.body.content;
      var options = {
        table: req.body.table,
        content: content
      };
      let r = emitter.invokeHook("db::remove::bulk",options);
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

  return router;

};