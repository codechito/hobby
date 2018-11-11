exports = async function(payload, response) {

  let request = EJSON.parse(payload.body.text());
  if(request._id) {
    request._id =BSON.ObjectId(request._id);
    let content = {
      "_id": request._id,
      "UserId": request.UserId,
      "PageId": request.PageId
    };
    const mdb = context.services.get('freelance');
    const requests = mdb.db("test").collection("Item");
    const { deletedCount } = await requests.deleteMany(content);

    response.setStatusCode(200);
    response.setHeader(
        "Content-Type",
        "application/json"
    );
    
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
    if(deletedCount){
      result.content.messages[0].text = "Item with code: " + request._id + " successfully removed.";
    }
    else{
     result.content.messages[0].text = "Sorry but item with code " + request._id + " cannot be removed."; 
    }
    
    response.setBody(JSON.stringify(result));
  } else {
    response.setStatusCode(400);
    response.setBody(`Invalid Content`);
  }
}