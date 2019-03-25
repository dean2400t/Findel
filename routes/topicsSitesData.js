var wtf = require('wtf_wikipedia');

var express = require('express');
const {Topic, validateTopic} = require('../models/topics');
const {SiteTopicEdge, validateSiteTopicEdge} = require('../models/siteTopicEdges');
const {Site, validateSite} = require('../models/sites');
const webScrape=require('../middleware/webScrape');
const googleSearch=require('../middleware/googleSearch');
var router = express.Router();

function function2() {
  // all the stuff you want to happen after that pause
  console.log('Blah blah blah blah extra-blah');
}

/*
Function 'findWhichUrlsNotInDataBase' recieves an unsorted urls(A) found by google and sorted urls of sites from the
database(B) which contains the urls found from google.
The function than returns the logical equivalent of A-B and returns only the new urls.
*/
function findWhichUrlsNotInDataBase(urls, foundUrlInDB) {
  if (foundUrlInDB.length==0)
    return urls;
  var newUrls=[];
  urls.sort();
  var dbIndex=0;
  for (var urlsIndex=0; urlsIndex<urls.length; urlsIndex++)
  {
    while (foundUrlInDB[dbIndex].siteURL!=urls[urlsIndex] && dbIndex<foundUrlInDB.length)
    {
      newUrls.push(urls[urlsIndex]);
      urlsIndex++;
    }
    dbIndex++;
  }
  return newUrls;
}

async function findNewSitesAndExistingSites(urlsFromGoogle)
{
  var checkedNewSites=[];
  var sitesInDataBase;
  if (urlsFromGoogle.length>0)
  {
    sitesInDataBase=await Site.find({siteURL: { $in: urlsFromGoogle }}).sort({siteURL:1});
    var newSitesToAdd=findWhichUrlsNotInDataBase(urlsFromGoogle, sitesInDataBase);
    for (var newSiteIndex=0; newSiteIndex<newSitesToAdd.length; newSiteIndex++)
    {
      var site={siteURL: newSitesToAdd[newSiteIndex]};
      let { error } = validateSite(site); 
      if (!error)
        checkedNewSites.push(new Site(site));
    }
  }
  return [checkedNewSites, sitesInDataBase];
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  //res.render('index');
  var search=req.query.search;

  var topic=await Topic.findOne({topicName: search});
  var sites=[];
  var urls=[];
  if (topic)
  {
    
  }
  else
  {
    topic={topicName:search};
    const {error}=validateTopic(topic);
    if (error) return res.status(400).send(error.details[0].message);
    topic=new Topic({topicName: search, lastGoogleUpdate: new Date()});
    
    urls=await googleSearch(search);
    [checkedNewSites, sitesInDataBase]= await findNewSitesAndExistingSites(urls);
    var edge;
    var edges=[];
    for (var siteIndex=0; siteIndex<sitesInDataBase.length; siteIndex++)
    {
      edge=new SiteTopicEdge({site: sitesInDataBase[siteIndex]._id, topic: topic._id, weight: 1});
      topic.siteTopicEdges.push(edge._id);
      edges.push(edge);
      await Site.updateOne({_id: sitesInDataBase[siteIndex].id}, {$push: {siteTopicEdges: edge._id}});
    }
    if (checkedNewSites.length>0)
    {
      for (siteIndex=0; siteIndex<checkedNewSites.length; siteIndex++)
      {
        edge=new SiteTopicEdge({site: checkedNewSites[siteIndex]._id, topic: topic._id, weight: 1});
        checkedNewSites[siteIndex].siteTopicEdges.push(edge._id);
        topic.siteTopicEdges.push(edge._id);
        edges.push(edge);
      }
      Site.insertMany(checkedNewSites);
    }
    SiteTopicEdge.insertMany(edges);
    await topic.save();
  }
  res.send(sites);
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