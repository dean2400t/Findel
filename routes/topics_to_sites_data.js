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
Function 'find_which_urls_are_not_in_DataBase' recieves an unsorted urls(A) found by google and sorted urls of sites from the
database(B) which contains the urls found from google.
The function than returns the logical equivalent of A-B and returns only the new urls.
*/
function find_which_urls_are_not_in_DataBase(urls, foundUrlInDB) {
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
Function 'find_new_sites_and_existing_sites' returns two arrays, one of the sites from the
database corrosponding to the urls, and the second is the new sites which are not in the database
*/
async function find_new_sites_and_existing_sites(urlsFromGoogle)
{
  var checkedNewSites=[];
  var sitesInDataBase;
  if (urlsFromGoogle.length>0)
  {
    sitesInDataBase=await Site.find({siteURL: { $in: urlsFromGoogle }}).sort({siteURL:1});
    var newSitesToAdd=find_which_urls_are_not_in_DataBase(urlsFromGoogle, sitesInDataBase);
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
async function get_sites_Ids_and_edges_from_topic(topic)
{
  var edgesToSites=await SiteTopicEdge.find({topic: topic});
  var sitesID=[];
  var siteToTopicEdges=[];
  for (var edgeIndex=0; edgeIndex<edgesToSites.length; edgeIndex++)
  {
    sitesID.push(edgesToSites[edgeIndex].site);
    siteToTopicEdges.push(edgesToSites[edgeIndex])
  }
  return [sitesID, siteToTopicEdges];
}

/*
Function searches google by topic and update database accordingly
*/
async function search_Google_and_orgenize(topic)
{
  var search=topic.topicName;
  var sites=[];
  var sitesInDataBase=[];
  var found;
  var objID;
  var urls=await googleSearch(search);
  [checkedNewSites, firstSitesFromDataBase]= await find_new_sites_and_existing_sites(urls);
  
  //Get urls and remove sites, already connected with an edge, from sitesInDataBase array
  if (topic.siteTopicEdges.length>0)
  {
    var [sitesIDs, tEdges]=await get_sites_Ids_and_edges_from_topic(topic);
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

function checkAuthAndReturnUserID(token)
{
  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    return decoded._id;
  }
  catch (ex) {
    return "";
  }
}

function binary_find_edge_from_site_by_IDs(edges, site, start, end) { 
       
  // Base Condtion 
  if (start > end) return null; 
 
  // Find the middle index 
  let mid=Math.floor((start + end)/2); 
 
  // Compare mid with given key x 
  if (edges[mid].site.equals(site._id)) return edges[mid]; 
        
  // If element at mid is greater than x, 
  // search in the left half of mid 
  if(edges[mid].site > site._id)  
      return binary_find_edge_from_site_by_IDs(edges, site, start, mid-1); 
  else

      // If element at mid is smaller than x, 
      // search in the right half of mid 
      return binary_find_edge_from_site_by_IDs(edges, site, mid+1, end); 
}

async function get_Sites_Edges_data_from_topic(topic, userID)
{
  
  var sites=[];
  var [sitesID, siteTopicEdges]=await get_sites_Ids_and_edges_from_topic(topic);
  var sitesFromEdges=await Site.find({_id: { $in: sitesID}}).sort();
  siteTopicEdges.sort();
  for (var siteIndex=0; siteIndex<sitesFromEdges.length; siteIndex++)
  {
    var edge= binary_find_edge_from_site_by_IDs(siteTopicEdges, sitesFromEdges[siteIndex], 0, sitesFromEdges.length-1);
    var userRankCode=0;
    if (userID!="")
      for (var rankIndex=0; rankIndex<edge.usersRanking.length; rankIndex++)
        if (edge.usersRanking[rankIndex].userID.equals(userID))
        {
          userRankCode=edge.usersRanking[rankIndex].rankCode;
          if (userRankCode==1)
            edge.weight-=edge.usersRanking[rankIndex].scoreAdded-1;
          if (userRankCode==2)
            edge.weight+=edge.usersRanking[rankIndex].scoreAdded-1;
        }
    sites.push({
      siteURL: sitesFromEdges[siteIndex]['siteURL'],
      userRankCode: userRankCode,
      edgeWeight: edge.weight
    });
  }
  return sites;
}

/* GET home page. */
router.get('/', async function(req, res) {
  //res.render('index');
  var search=req.query.search;
  var token=req.headers['findel-auth-token'];
  var userID= checkAuthAndReturnUserID(token);
  var topic=await Topic.findOne({topicName: search});

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
      return res.status(200).send(await get_Sites_Edges_data_from_topic(topic, userID));

    //Topic needs to be google searched again
    sites= await search_Google_and_orgenize(topic);
    return res.status(200).send(await get_Sites_Edges_data_from_topic(topic, userID));
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
  sites= await search_Google_and_orgenize(topic);
  return res.status(200).send(await get_Sites_Edges_data_from_topic(topic, userID));
});
module.exports = router;