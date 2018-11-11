exports = async function(payload, response) {
  const request = EJSON.parse(payload.body.text());
  if(request.item && request.PageId && request.Photo) {
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
    const mdb = context.services.get('freelance');
    const requests = mdb.db("test").collection("Item");
    const { insertedId } = await requests.insertOne(item);
    
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
    if(insertedId){
      result.content.messages[0].text = "Your item are now registered and it is now searchable. This is your Rate Code: "+insertedId+". give it to your customer who wish to rate " + item.Name;
    }
    else{
     result.content.messages[0].text = "Sorry but we are not able to post your item."; 
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