exports = async function(payload, response) {
  const request = EJSON.parse(payload.body.text());
  if(request.item && request.PageId && request.Photo && request._id) {
    let input = JSON.parse("[" +request.item[0] + "]");
    let item = {
        PageId:request.PageId,
        Photo: request.Photo,
        UserId: request.UserId
    };
    input.forEach(function(element){
      for(var i in element){
        item[i] = element[i];
      }
    });
    let search = {
      "_id": BSON.ObjectId(request._id)
    };
    const mdb = context.services.get('freelance');
    const requests = mdb.db("test").collection("Item");
    const { matchedCount } = await requests.updateOne(search,item);
    
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
      result.content.messages[0].text = "Your item are now updated";
    }
    else{
     result.content.messages[0].text = "Sorry but we are not able to update your item."; 
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