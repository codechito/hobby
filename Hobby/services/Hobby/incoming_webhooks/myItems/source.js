exports = async function(payload, response) {

  let request = EJSON.parse(payload.body.text());
  if(request.keyword && request.PageId && request.UserId) {
    
    const mdb = context.services.get('freelance');
    const requests = mdb.db("test").collection("Item");
    const keyword = new BSON.BSONRegExp(request.keyword, "i");
    let content = {
      "$or": [
        {
          "Name": keyword
        },
        {
          "Description": keyword
        }
      ],
      "PageId": request.PageId,
      "UserId": request.UserId
    };
    
    
    const cursor = requests.find(content).limit(request.limit||10).limit(request.skip||0);
    
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
    
    let dCtr=0;
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      dCtr++;
      let rate = 0;
      if(doc.Prating && doc.Visitor){
        rate = Math.round(((doc.Prating/doc.Visitor)*100)* 100)/100;
      }
      if(doc.Photo){
        elements.elements.push({
          "title": doc.Name + " for only " + doc.Price + ",  Rating: " + rate + "%",
          "subtitle": "Rate Code: " + doc._id +  " Description: " + doc.Description,
          "image_url": doc.Photo,
          "buttons": [
            {
              "type": "flow",
              "caption": "Update",
              "target": "content20181111010629_321757"
            },
            {
              "type": "dynamic_block_callback",
              "caption": "Remove",
              "url": "https://webhooks.mongodb-stitch.com/api/client/v2.0/app/hobby-uvpgg/service/Hobby/incoming_webhook/remove",
              "method": "post",
              "payload": {
                "_id": doc._id,
                "UserId": doc.UserId,
                "PageId": doc.PageId
              }
            }
          ]
        });  
      }
    }
    response.setStatusCode(200);
    response.setHeader(
        "Content-Type",
        "application/json"
    );
    if(dCtr){
      result.content.messages.push(elements);
    }
    else{
      result.content.messages.push({
        "type": "text",
        "text": "Looks like your search does not exist yet, try different terms these time."   
      });
    }
    response.setBody(JSON.stringify(result));
  } else {
    response.setStatusCode(400);
    response.setBody(`Invalid Content`);
  }
};