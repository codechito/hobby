exports = async function(payload, response) {

  let request = EJSON.parse(payload.body.text());
  if(request.keyword && request.PageId) {
    
    const mdb = context.services.get('freelance');
    const requests = mdb.db("test").collection("Item");
    
    const keyword = new BSON.BSONRegExp(request.keyword, "i");
    let content = {
      "$or": [
        {
          "Description": keyword
        },
        {
          "Name": keyword
        }
      ],
      "PageId": request.PageId
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
    let dCtr = 0;
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      dCtr++;
      let rate = 0;
      if(doc.Prating && doc.Visitor){
        rate = Math.round(((doc.Prating/doc.Visitor)*100)* 100)/100;
      }
      if(doc.Photo){
        elements.elements.push({
          "title": doc.Name + " for only " + doc.Price + ",  Rating: " + rate + "%",
          "subtitle": doc.Description,
          "image_url": doc.Photo,
          "buttons": [
            {
              "type": "share"
            },
            {
              "type": "url",
              "caption": "Chat Me",
              "url": "https://m.me/" + doc.Link
            },
            {
              "type": "flow",
              "caption": "Rate Me",
              "target": "content20181109041631_068607"
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
}