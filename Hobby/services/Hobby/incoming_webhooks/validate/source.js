exports = async function(payload, response) {

  let request = EJSON.parse(payload.body.text());
  if(request.content) {
    
    const mdb = context.services.get('freelance');
    const requests = mdb.db("test").collection("Item");
    
    request.content._id = BSON.ObjectId(request.content._id);
    const cursor = requests.find(request.content);
    
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      let rate = 0;
      if(doc.Prating && doc.Visitor){
        rate = Math.round(((doc.Prating/doc.Visitor)*100)* 100)/100;
      }
      if(doc.Photo){
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
                        "image_url": doc.Photo,
                        "buttons": [
                          {
                            "type": "dynamic_block_callback",
                            "caption": "Happy",
                            
                            "url": "https://webhooks.mongodb-stitch.com/api/client/v2.0/app/hobby-uvpgg/service/Hobby/incoming_webhook/rating",
                            "method": "post",
                            "payload": {
                                "positive": true,
                                "_id": doc._id,
                                "UserId": doc.UserId,
                                "PageId": doc.PageId
                            }
                          },
                          {
                              "type": "dynamic_block_callback",
                              "caption": "Sad",
                              "url": "https://webhooks.mongodb-stitch.com/api/client/v2.0/app/hobby-uvpgg/service/Hobby/incoming_webhook/rating",
                              "method": "post",
                              "payload": {
                                  "positive": false,
                                  "_id": doc._id,
                                  "UserId": doc.UserId,
                                  "PageId": doc.PageId
                              }
                          }
                        ]
                      }
                    ]
                  }
                ]
          }
        };
        response.setStatusCode(200);
        response.setHeader(
            "Content-Type",
            "application/json"
        );
        response.setBody(JSON.stringify(result));
      }
      else{
        response.setStatusCode(400);
        response.setBody(`Invalid Content`);
      }
    }
  } else {
    response.setStatusCode(400);
    response.setBody(`Invalid Content`);
  }
}