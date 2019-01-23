var wtf = require('wtf_wikipedia');
const {google} = require('googleapis');
var express = require('express');
const extractDataFromRefLink=require('../middleware/basicSearch/searchFunctions');
const rabinKarpSearch=require('../middleware/rabinKarpSearch');
const getTextFromURL=require('../middleware/webScrape');
var router = express.Router();

function function2() {
  // all the stuff you want to happen after that pause
  console.log('Blah blah blah blah extra-blah');
}

/* GET home page. */
router.get('/:search', async function(req, res, next) {
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    console.log('favicon requested');
    return;
  }
  var search=req.params.search;
  if (search.indexOf("favicon") > -1)
  {
    console.log("favicon");
    setTimeout(function2, 5000);
  }
  else
  {
    var doc= await wtf.fetch(search, "he")
    var links;
    if (doc!=null)
      var links=doc.links();
    var action;
    var data;
    var referTo;
    if (doc==null)
      return res.send("here");
    else if (links.length==0)
    {
      referTo=doc.templates();
      referTo=referTo[1].list[0];
    }
    else
    {
      var cusSearch=google.customsearch({
        version:'v1'
      });
      var params={
        q: search,
        
        key: 'AIzaSyCUTlh1nkTWMgeTEQeH3B2D3U63FHOIs2k',
        cx: '018379670787079815574:w_a1jjwdpqm'
      };
      var results1= await cusSearch.cse.list(params);
      params.start=11;
      var results2= await cusSearch.cse.list(params);
      params.start=21;
      var results3= await cusSearch.cse.list(params);
      var texts=[];
      for (var index=0; index<10; index++)
      {
        texts.push({"url": results1.data.items[index].formattedUrl,"text": await getTextFromURL(results1.data.items[index].formattedUrl)});
        texts.push({"url": results2.data.items[index].formattedUrl,"text": await getTextFromURL(results2.data.items[index].formattedUrl)});
        texts.push({"url": results3.data.items[index].formattedUrl,"text": await getTextFromURL(results3.data.items[index].formattedUrl)});

      }
      var linksSum=rabinKarpSearch(links, texts);
      action="links";
      data=links;
    }
    if (referTo!=null)
    {
      data=extractDataFromRefLink(referTo);
      action="wikipediaReferMenu";
    }
  }
  
  



  res.action = action;
  res.wikiData = data;
});
module.exports = router;
