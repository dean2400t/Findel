const jwt = require('jsonwebtoken');
const config = require('config');

var express = require('express');
const {Topic, validateTopic} = require('../models/topics');
const {SiteTopicEdge} = require('../models/siteTopicEdges');
const {Site, validateSite} = require('../models/sites');
const googleSearch=require('../middleware/googleSearch');
const {User} = require('../models/users');
const {Search}=require('../models/searches');
var router = express.Router();

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
    if (dbIndex==foundUrlInDB.length)
      newUrls.push(urls[urlsIndex])
    else
    {
      while (foundUrlInDB[dbIndex].siteURL!=urls[urlsIndex] && dbIndex<foundUrlInDB.length && urlsIndex<urls.length)
      {
        newUrls.push(urls[urlsIndex]);
        urlsIndex++;
      }
      dbIndex++;
    }
  }
  return newUrls;
}

/*
Function 'findNewSitesAndExistingSites' returns two arrays, one of the sites from the
database corrosponding to the urls, and the second is the new sites which are not in the database
*/
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

//Function returns objectsIDs of the sites which are in the topic
async function getSitesIDsFromTopicEdges(topic)
{
  var edgesToSites=await SiteTopicEdge.find({topic: topic});
  var sitesID=[];
  for (var edgeIndex=0; edgeIndex<edgesToSites.length; edgeIndex++)
    sitesID.push(edgesToSites[edgeIndex].site);
  return sitesID;
}

/*
Function searches google by topic and update database accordingly
*/
async function searchGoogleAndOrgenize(topic)
{
  var search=topic.topicName;
  var sites=[];
  var sitesInDataBase=[];
  var found;
  var objID;
  var urls=await googleSearch(search);
  [checkedNewSites, firstSitesFromDataBase]= await findNewSitesAndExistingSites(urls);
  
  //Get urls and remove sites, already connected with an edge, from sitesInDataBase array
  if (topic.siteTopicEdges.length>0)
  {
    var sitesIDs=await getSitesIDsFromTopicEdges(topic);
    for (var siteIndex=0; siteIndex<firstSitesFromDataBase.length; siteIndex++)
    {
      objID=firstSitesFromDataBase[siteIndex]._id;
      found=sitesIDs.find(function(element) {
        return element = objID;
      });
      if (!found)
        sitesInDataBase.push(firstSitesFromDataBase[siteIndex]);
      else
        sites.push(firstSitesFromDataBase[siteIndex].siteURL);
    }
  }

  //Build edges for current topic to found google sites
  var edge;
  var edges=[];
  for (var siteIndex=0; siteIndex<sitesInDataBase.length; siteIndex++)
  {
    edge=new SiteTopicEdge({site: sitesInDataBase[siteIndex]._id, topic: topic._id, weight: 1});
    topic.siteTopicEdges.push(edge._id);
    edges.push(edge);
    await Site.updateOne({_id: sitesInDataBase[siteIndex].id}, {$push: {siteTopicEdges: edge._id}});
    sites.push(sitesInDataBase[siteIndex].siteURL);
  }
  if (checkedNewSites.length>0)
  {
    for (siteIndex=0; siteIndex<checkedNewSites.length; siteIndex++)
    {
      edge=new SiteTopicEdge({site: checkedNewSites[siteIndex]._id, topic: topic._id, weight: 1});
      checkedNewSites[siteIndex].siteTopicEdges.push(edge._id);
      topic.siteTopicEdges.push(edge._id);
      edges.push(edge);
      sites.push(checkedNewSites[siteIndex].siteURL);
    }
    
    Site.insertMany(checkedNewSites);
  }
  SiteTopicEdge.insertMany(edges);
  topic.lastGoogleUpdate=Date.now();
  await topic.save();
  return sites;
}

async function checkAuthAndReturnUserID(token)
{
  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    return decoded._id;
  }
  catch (ex) {
    return "";
  }
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  //res.render('index');
  var search=req.query.search;
  var token=req.headers['findel-auth-token'];
  var userID=await checkAuthAndReturnUserID(token);
  var topic=await Topic.findOne({topicName: search});
  var sites=[];
  if (topic)
  {
    if (userID!="")
    {
      var search=new Search({topic: topic._id})
      await User.updateOne({_id: userID}, {$push: {searches: search}});
    }
    var googleSearchAge=new Date() - topic.lastGoogleUpdate;
    var numOfDaysToLive=3;

    //Topic was google searched recently
    if(googleSearchAge<numOfDaysToLive*86400000)
    {
      var sitesID=await getSitesIDsFromTopicEdges(topic);
      var sitesFromEdges=await Site.find({_id: { $in: sitesID}});
      for (var siteIndex=0; siteIndex<sitesFromEdges.length; siteIndex++)
        sites.push(sitesFromEdges[siteIndex]['siteURL']);
      return res.status(200).send(sites);
    }

    //Topic needs to be google searched again
    sites= await searchGoogleAndOrgenize(topic);
    return res.status(200).send(sites);
  }

  //New topic
  topic={topicName:search};
  const {error}=validateTopic(topic);
  if (error) return res.status(400).send(error.details[0].message);
  topic=new Topic({topicName: search, lastGoogleUpdate: new Date()});
  if (userID!="")
    {
      var search=new Search({topic: topic._id})
      await User.updateOne({_id: userID}, {$push: {searches: search}});
    }
  sites= await searchGoogleAndOrgenize(topic);
  return res.status(200).send(sites);
});
module.exports = router;