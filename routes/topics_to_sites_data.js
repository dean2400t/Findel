const jwt = require('jsonwebtoken');
const config = require('config');

var express = require('express');
const {Topic, validateTopic} = require('../models/topics');
const {SiteTopicEdge} = require('../models/siteTopicEdges');
const {Site} = require('../models/sites');
const googleSearch=require('../middleware/googleSearch');
const {Domain} = require('../models/domains');
const {add_and_update_domain, 
       site_to_topic_edge_save,
       site_save,
       topic_save} = require('../middleware/save_securely_to_database');
const {User} = require('../models/users');
const {Search}=require('../models/searches');
const {Site_topic_edges_ranking} = require('../models/site_topic_edges_ranking');
var router = express.Router();

function binary_find_site_in_sites_by_url(sites, site, start, end) {     
  if (start > end) return null; 
  let mid=Math.floor((start + end)/2); 
  if (sites[mid].siteURL == site.siteURL) return sites[mid]; 
  if(sites[mid].siteURL > site.siteURL)  
      return binary_find_site_in_sites_by_url(sites, site, start, mid-1); 
  else 
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
Function 'add_new_sites_and_return_sites_from_database' inserts new sites from google to database and
returns a documents array of sites in database which includes the new sites entered 
*/
async function add_new_sites_and_return_sites_from_database(sites)
{
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
      var site=new Site({siteURL: newSitesToAdd[newSiteIndex].siteURL,
        siteFormatedURL: newSitesToAdd[newSiteIndex].formattedUrl,
        siteSnap:  newSitesToAdd[newSiteIndex].snippet
      });
      site = await site_save(site);
      if (!site)
        console.log("fatal site save error");
      else
      {
        site = await add_and_update_domain(site);
        sitesInDataBase.push(site);
      }
    }
  }
  return sitesInDataBase;
}

async function get_populated_edges_to_sites(topic)
{
  var edgesToSites=await SiteTopicEdge.find({topic: topic}).populate('site');
  return edgesToSites;
}


function binary_find_site_in_edges_by_url(edges, site, start, end) {
  if (start > end) return null; 
  
  let mid=Math.floor((start + end)/2); 
  if (edges[mid].site.siteURL == site.siteURL) return edges[mid];
  if(edges[mid].site.siteURL > site.siteURL)  
      return binary_find_site_in_edges_by_url(edges, site, start, mid-1); 
  else
      return binary_find_site_in_edges_by_url(edges, site, mid+1, end); 
}


async function filter_already_connected_sites_in_database(sites_in_database, sites_from_google, topic)
{
  if (topic.siteTopicEdges.length>0)
  {
    var sites_edges = await get_populated_edges_to_sites(topic);
    var already_connected_edges=[];
    sites_edges.forEach(edge => {
      already_connected_edges.push(edge);
    });
    already_connected_edges.sort((edge1, edge2) => {if (edge2.site.siteURL>edge1.site.siteURL) return -1; else return 1;});
    
    var sites_in_db_which_are_not_connected=[];
    sites_in_database.forEach(async site_in_database => {
      var connected_edge = binary_find_site_in_edges_by_url(already_connected_edges, site_in_database, 0, already_connected_edges.length-1);
      if (!connected_edge)
        sites_in_db_which_are_not_connected.push(site_in_database);
      else
        {
          var google_site=binary_find_site_in_sites_by_url(sites_from_google, connected_edge.site,0, sites_from_google.length-1);
          if (!google_site)
            google_site={order_index_by_google: null};
          await SiteTopicEdge.findByIdAndUpdate(connected_edge._id, {order_index_by_google: google_site.order_index_by_google});
        }
    });
    return sites_in_db_which_are_not_connected;
  }
  else
    return sites_in_database;
  
}
/*
Function searches google by topic and update database accordingly
*/
async function search_Google_and_orgenize(topic)
{
  var search=topic.topicName;
  var sites=[];
  var sites_from_google=await googleSearch(search);
  sites_in_database = await add_new_sites_and_return_sites_from_database(sites_from_google);
  var sites_in_db_which_are_not_connected= await filter_already_connected_sites_in_database(sites_in_database, sites_from_google, topic);

  //Build edges for current topic to found google sites
  var edge;
  var sites=[];
  var new_site_topic_edges=[];
  for (var siteIndex=0; siteIndex<sites_in_db_which_are_not_connected.length; siteIndex++)
  {
    var google_site=binary_find_site_in_sites_by_url(sites_from_google, sites_in_db_which_are_not_connected[siteIndex],0, sites_from_google.length-1);
    if (!google_site)
      google_site={order_index_by_google: null};
    edge = new SiteTopicEdge({site: sites_in_db_which_are_not_connected[siteIndex]._id, topic: topic._id, order_index_by_google: google_site.order_index_by_google});
    edge = await site_to_topic_edge_save(edge);
    if (edge)
    {
      new_site_topic_edges.push(edge._id);
      await Site.updateOne({_id: sites_in_db_which_are_not_connected[siteIndex].id}, {$addToSet: {siteTopicEdges: edge._id}});
      sites.push(sites_in_db_which_are_not_connected[siteIndex]);
    }
  }

  if (new_site_topic_edges.length>0)
    await Topic.findOneAndUpdate({_id: topic._id}, {$addToSet: {siteTopicEdges: {$each: new_site_topic_edges}}, lastGoogleUpdate: Date.now()});

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
  if (userID == "")
    var edges_to_sites = await SiteTopicEdge.find({topic: topic})
    .populate('site');
  else
    var edges_to_sites = await SiteTopicEdge.find({topic: topic})
      .populate('site')
      .populate({
        path: 'usersRanking',
        match: { user: userID}
      });
  
  for (var index=0; index<edges_to_sites.length; index++)
    edges_to_sites[index].site.domain = await Domain.findById(edges_to_sites[index].site.domain).select('-sites -userRankings');
  
  edges_to_sites.forEach(edge_to_site => {
    if (userID != "")
      var user_rankings = edge_to_site.usersRanking;
    else
      var user_rankings = [];
    var site = edge_to_site.site;
    sites.push({
      siteID: site._id,
      edgeID: edge_to_site._id,
      siteURL: site['siteURL'],
      siteFormatedURL: site['siteFormatedURL'],
      siteSnap: site['siteSnap'],
      domain: site['domain'],
      user_rankings: user_rankings,
      liked_weight: edge_to_site.liked_weight,
      trustworthy_weight: edge_to_site.trustworthy_weight,
      educational_weight: edge_to_site.educational_weight,
      order_index_by_google: edge_to_site.order_index_by_google
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
  topic=new Topic({topicName: search});
  topic = await topic_save(topic);
  if (userID!="")
    {
      var search=new Search({topic: topic._id})
      await User.updateOne({_id: userID}, {$push: {searches: search}});
    }
  sites= await search_Google_and_orgenize(topic);
  return res.status(200).send(await get_Sites_Edges_data_from_topic(topic, userID));
});
module.exports = router;