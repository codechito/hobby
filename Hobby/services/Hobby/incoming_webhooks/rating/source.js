exports = async function(payload, response) {

  let request = EJSON.parse(payload.body.text());
  if(request._id && request.UserId && request.PageId) {
    
    const mdb = context.services.get('freelance');
    const requests = mdb.db("test").collection("Item");

    let rating = {};
    if(request.positive){
      rating = { "Prating": 1, "Visitor": 1};
    }
    else{
      rating = { "Nrating": 1, "Visitor": 1};
    }

    const { matchedCount } = await requests.updateOne({
      "_id": BSON.ObjectId(request._id),
      "Raters": { "$nin": [request.UserId]},
      "PageId": request.PageId
    },{
      "$inc": rating,
      "$push": { "Raters": request.UserId }
    });
    
    let result = {
      "version": "v2",
      "content": {
        "messages": [
          {
            "type": "text",
            "text": ""    
          }
    	  ]
      }
    };
    if(matchedCount){
      result.content.messages[0].text = "Thank you very much for your feedback, It will help us improve our product/service.";
    }
    else{
     result.content.messages[0].text = "Sorry but you can only give 1 feedback per item."; 
    }
    response.setStatusCode(200);
    response.setHeader(
      "Content-Type",
      "application/json"
    );
    response.setBody(JSON.stringify(result));
      
  } else {
    response.setStatusCode(400);
    response.setBody(`Invalid Content`);
  }
}