const jwt = require('jsonwebtoken');
const config = require('config');

var express = require('express');
const {Topic, validateTopic} = require('../models/topics');
const {SiteTopicEdge} = require('../models/siteTopicEdges');
const {Site, validateSite} = require('../models/sites');
const googleSearch=require('../middleware/googleSearch');
const {Domain} = require('../models/domains');
const {User} = require('../models/users');
const {Search}=require('../models/searches');
const parseDomain = require("parse-domain");
var router = express.Router();

function binary_find_site_in_sites_by_url(sites, site, start, end) {    
  // Base Condtion 
  if (start > end) return null; 
 
  // Find the middle index 
  let mid=Math.floor((start + end)/2); 
 
  // Compare mid with given key x 
  if (sites[mid].siteURL == site.siteURL) return sites[mid]; 
        
  // If element at mid is greater than x, 
  // search in the left half of mid 
  if(sites[mid].siteURL > site.siteURL)  
      return binary_find_site_in_sites_by_url(sites, site, start, mid-1); 
  else

      // If element at mid is smaller than x, 
      // search in the right half of mid 
      return binary_find_site_in_sites_by_url(sites, site, mid+1, end); 
}

function find_which_sites_are_not_in_DataBase(sites, found_sites_in_db) {
  if (found_sites_in_db.length==0)
    return sites;
  var newSites=[];
  found_sites_in_db.sort((site1, site2) => {if (site2.siteURL>site1.siteURL) return -1; else return 1;});
  sites.forEach(site => {
    var found_site = binary_find_site_in_sites_by_url(found_sites_in_db, site, 0, found_sites_in_db.length-1);
    if (!found_site)
      newSites.push(site);
  });
  return newSites;
}

/*
Function 'find_new_sites_and_existing_sites' returns two arrays, one of the sites from the
database corrosponding to the urls, and the second is the new sites which are not in the database
*/
async function find_new_sites_and_existing_sites(sites)
{
  var checkedNewSites=[];
  var sitesInDataBase;
  var sites_from_google=[];
  sites.forEach(site => {
    sites_from_google.push(site.siteURL);
  });
  if (sites_from_google.length>0)
  {
    sitesInDataBase=await Site.find({siteURL: { $in: sites_from_google }}).sort({siteURL:1});
    var newSitesToAdd=find_which_sites_are_not_in_DataBase(sites, sitesInDataBase);
    for (var newSiteIndex=0; newSiteIndex<newSitesToAdd.length; newSiteIndex++)
    {
      var site={siteURL: newSitesToAdd[newSiteIndex].siteURL,
        siteFormatedURL: newSitesToAdd[newSiteIndex].formattedUrl,
        siteSnap:  newSitesToAdd[newSiteIndex].snippet
      };
      checkedNewSites.push(new Site(site));
    }
  }
  return [checkedNewSites, sitesInDataBase];
}

//Function returns objectsIDs of the sites which are in the topic
async function get_populated_edges_to_sites(topic)
{
  var edgesToSites=await SiteTopicEdge.find({topic: topic}).populate('site');
  return edgesToSites;
}



async function add_and_update_domains(new_sites)
{
  var sites_index_to_domain_array=[];
  sites_index_to_domain_array[new_sites.length-1]=undefined;
  if (new_sites.length>0)
  {
    for (var newSiteIndex=0; newSiteIndex<new_sites.length; newSiteIndex++)
    {
      var site_domainURL = parseDomain(new_sites[newSiteIndex].siteURL);
      site_domainURL = site_domainURL.domain + '.' + site_domainURL.tld;
      var domain = await Domain.findOne({domainURL: site_domainURL});
      if (!domain)
          domain = new Domain({domainURL: site_domainURL, score: 1});
      domain.sites.push(new_sites[newSiteIndex]._id);
      new_sites[newSiteIndex].domain = domain._id;
      await domain.save();
    }
  }
}


/*
Function searches google by topic and update database accordingly
*/
async function search_Google_and_orgenize(topic)
{
  var search=topic.topicName;
  var sites=[];
  var sites_from_google=await googleSearch(search);
  [new_sites, sites_in_database]= await find_new_sites_and_existing_sites(sites_from_google);
  
  //Get sites and remove sites, already connected with an edge, from sitesInDataBase array
  var sites=[];
  var sites_in_db_which_are_not_connected=[];
  if (topic.siteTopicEdges.length>0)
  {
    var sites_edges = await get_populated_edges_to_sites(topic);
    var already_connected_sites=[];
    sites_edges.forEach(edge => {
      already_connected_sites.push(edge.site);
    });
    already_connected_sites.sort((site1, site2) => {if (site2.siteURL>site1.siteURL) return -1; else return 1;});
    
    sites_in_database.forEach(site_in_database => {
      var is_already_connected_sites_found = binary_find_site_in_sites_by_url(already_connected_sites, site_in_database, 0, already_connected_sites.length-1);
      if (!is_already_connected_sites_found)
        sites_in_db_which_are_not_connected.push(site_in_database);
    });
  }

  //Build edges for current topic to found google sites
  var edge;
  var edges=[];
  for (var siteIndex=0; siteIndex<sites_in_db_which_are_not_connected.length; siteIndex++)
  {
    edge=new SiteTopicEdge({site: sites_in_db_which_are_not_connected[siteIndex]._id, topic: topic._id, weight: 1});
    topic.siteTopicEdges.push(edge._id);
    await edge.save();
    await Site.updateOne({_id: sites_in_db_which_are_not_connected[siteIndex].id}, {$push: {siteTopicEdges: edge._id}});
    sites.push(sites_in_db_which_are_not_connected[siteIndex]);
  }
  if (new_sites.length>0)
  {
    for (siteIndex=0; siteIndex<new_sites.length; siteIndex++)
    {
      edge=new SiteTopicEdge({site: new_sites[siteIndex]._id, topic: topic._id, weight: 1});
      new_sites[siteIndex].siteTopicEdges.push(edge._id);
      topic.siteTopicEdges.push(edge._id);
      edges.push(edge);
      sites.push(new_sites[siteIndex]);
    }
    await add_and_update_domains(new_sites);
    Site.insertMany(new_sites);
    SiteTopicEdge.insertMany(edges);
  }
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

async function get_Sites_Edges_data_from_topic(topic, userID)
{
  
  var sites=[];
  var edges_to_sites = await SiteTopicEdge.find({topic: topic}).populate('site');
  for (var index=0; index<edges_to_sites.length; index++)
    edges_to_sites[index].site.domain = await Domain.findById(edges_to_sites[index].site.domain).select('-sites -userRankings');

  edges_to_sites.forEach(edge_to_site => {
    var userRankCode=0;
    if (userID!="")
      for (var rankIndex=0; rankIndex<edge_to_site.usersRanking.length; rankIndex++)
        if (edge_to_site.usersRanking[rankIndex].userID.equals(userID))
          userRankCode=edge_to_site.usersRanking[rankIndex].rankCode;
    sites.push({
      siteID: edge_to_site.site._id,
      edgeID: edge_to_site._id,
      siteURL: edge_to_site.site['siteURL'],
      siteFormatedURL: edge_to_site.site['siteFormatedURL'],
      siteSnap: edge_to_site.site['siteSnap'],
      domain: edge_to_site.site['domain'],
      userRankCode: userRankCode,
      edgeWeight: edge_to_site.weight
    });
  });
  
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