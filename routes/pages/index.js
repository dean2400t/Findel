var wtf = require('wtf_wikipedia');
const {google} = require('googleapis');
var express = require('express');
//const extractDataFromRefLink=require('../../middleware/basicSearch/searchFunctions');
const rabinKarpSearch=require('../../middleware/rabinKarpSearch');
const getTextFromURL=require('../../middleware/webScrape');
var router = express.Router();

function function2() {
  // all the stuff you want to happen after that pause
  console.log('Blah blah blah blah extra-blah');
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index');
  /*var search=req.query.search;
  var result = await getTextFromURL(search);
  res.send(result);*/
});
module.exports = router;
  
  /*
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

      var allRes=[];
      allRes.push(results1);
      allRes.push(results2);
      allRes.push(results3);
      var siteNum=0;
      for (var r=0; r<3; r++)
        if (allRes[r]!=null)
          for (var index=0; index<10; index++)
              if (allRes[r].data.items[index]!=null)
              {
                console.log(siteNum +": "+allRes[r].data.items[index].formattedUrl);
                texts.push({"url": allRes[r].data.items[index].formattedUrl,"text": await getTextFromURL(allRes[r].data.items[index].formattedUrl)});
                siteNum++;
              }

      links.push({page: cusSearch, text: cusSearch})

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
  */