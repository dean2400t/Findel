const jwt = require('jsonwebtoken');
const config = require('config');

var express = require('express');
const {Topic, validate_topic} = require('../models/topics');
const {Page_topic_edge} = require('../models/page_topic_edges');
const {Page} = require('../models/pages');
const googleSearch=require('../middleware/googleSearch');
const {Domain} = require('../models/domains');
const {add_and_update_domain, 
       page_to_topic_edge_save,
       page_save,
       topic_save} = require('../middleware/save_securely_to_database');
const {User} = require('../models/users');
const {Search}=require('../models/searches');
const {Page_topic_edges_ranking} = require('../models/page_topic_edges_ranking');
var router = express.Router();

function binary_find_page_in_pages_by_url(pages, page, start, end) {     
  if (start > end) return null; 
  let mid=Math.floor((start + end)/2); 
  if (pages[mid].pageURL == page.pageURL) return pages[mid]; 
  if(pages[mid].pageURL > page.pageURL)  
      return binary_find_page_in_pages_by_url(pages, page, start, mid-1); 
  else 
      return binary_find_page_in_pages_by_url(pages, page, mid+1, end); 
}

function find_which_pages_are_not_in_DataBase(pages, found_pages_in_db) {
  if (found_pages_in_db.length==0)
    return pages;
  var new_pages=[];
  found_pages_in_db.sort((page1, page2) => {if (page2.pageURL>page1.pageURL) return -1; else return 1;});
  pages.forEach(page => {
    var found_page = binary_find_page_in_pages_by_url(found_pages_in_db, page, 0, found_pages_in_db.length-1);
    if (!found_page)
      new_pages.push(page);
  });
  return new_pages;
}

/*
Function 'add_new_pages_and_return_pages_from_database' inserts new pages from google to database and
returns a documents array of pages in database which includes the new pages entered 
*/
async function add_new_pages_and_return_pages_from_database(pages)
{
  var pages_in_database;
  var pages_from_google=[];
  pages.forEach(page => {
    pages_from_google.push(page.pageURL);
  });
  if (pages_from_google.length>0)
  {
    pages_in_database=await Page.find({pageURL: { $in: pages_from_google }}).sort({pageURL:1});
    var new_pages_to_add=find_which_pages_are_not_in_DataBase(pages, pages_in_database);
    for (var new_page_index=0; new_page_index<new_pages_to_add.length; new_page_index++)
    {
      var page=new Page({pageURL: new_pages_to_add[new_page_index].pageURL,
        pageFormatedURL: new_pages_to_add[new_page_index].formattedUrl,
        pageSnap:  new_pages_to_add[new_page_index].snippet
      });
      page = await page_save(page);
      if (!page)
        console.log("fatal page save error");
      else
      {
        page = await add_and_update_domain(page);
        pages_in_database.push(page);
      }
    }
  }
  return pages_in_database;
}

async function get_populated_edges_to_pages(topic)
{
  var edges_to_pages=await Page_topic_edge.find({topic: topic}).populate('page');
  return edges_to_pages;
}


function binary_find_page_in_edges_by_url(edges, page, start, end) {
  if (start > end) return null; 
  
  let mid=Math.floor((start + end)/2); 
  if (edges[mid].page.pageURL == page.pageURL) return edges[mid];
  if(edges[mid].page.pageURL > page.pageURL)  
      return binary_find_page_in_edges_by_url(edges, page, start, mid-1); 
  else
      return binary_find_page_in_edges_by_url(edges, page, mid+1, end); 
}


async function filter_already_connected_pages_in_database(pages_in_database, pages_from_google, topic)
{
  if (topic.page_topic_edges.length>0)
  {
    var pages_edges = await get_populated_edges_to_pages(topic);
    var already_connected_edges=[];
    pages_edges.forEach(edge => {
      already_connected_edges.push(edge);
    });
    already_connected_edges.sort((edge1, edge2) => {if (edge2.page.pageURL>edge1.page.pageURL) return -1; else return 1;});
    
    var pages_in_db_which_are_not_connected=[];
    pages_in_database.forEach(async page_in_database => {
      var connected_edge = binary_find_page_in_edges_by_url(already_connected_edges, page_in_database, 0, already_connected_edges.length-1);
      if (!connected_edge)
        pages_in_db_which_are_not_connected.push(page_in_database);
      else
        {
          var page_from_google=binary_find_page_in_pages_by_url(pages_from_google, connected_edge.page,0, pages_from_google.length-1);
          if (!page_from_google)
            page_from_google={order_index_by_google: null};
          await Page_topic_edge.findByIdAndUpdate(connected_edge._id, {order_index_by_google: page_from_google.order_index_by_google});
        }
    });
    return pages_in_db_which_are_not_connected;
  }
  else
    return pages_in_database;
  
}
/*
Function searches google by topic and update database accordingly
*/
async function search_Google_and_orgenize(topic)
{
  var search=topic.topicName;
  var pages=[];
  var pages_from_google=await googleSearch(search);
  pages_in_database = await add_new_pages_and_return_pages_from_database(pages_from_google);
  var pages_in_db_which_are_not_connected= await filter_already_connected_pages_in_database(pages_in_database, pages_from_google, topic);

  //Build edges for current topic to found google pages
  var edge;
  var pages=[];
  var new_page_topic_edges=[];
  for (var pageIndex=0; pageIndex<pages_in_db_which_are_not_connected.length; pageIndex++)
  {
    var page_from_google=binary_find_page_in_pages_by_url(pages_from_google, pages_in_db_which_are_not_connected[pageIndex],0, pages_from_google.length-1);
    if (!page_from_google)
      page_from_google={order_index_by_google: null};
    edge = new Page_topic_edge({page: pages_in_db_which_are_not_connected[pageIndex]._id, topic: topic._id, order_index_by_google: page_from_google.order_index_by_google});
    edge = await page_to_topic_edge_save(edge);
    if (edge)
    {
      new_page_topic_edges.push(edge._id);
      await Page.updateOne({_id: pages_in_db_which_are_not_connected[pageIndex].id}, {$addToSet: {page_topic_edges: edge._id}});
      pages.push(pages_in_db_which_are_not_connected[pageIndex]);
    }
  }

  if (new_page_topic_edges.length>0)
    await Topic.findOneAndUpdate({_id: topic._id}, {$addToSet: {page_topic_edges: {$each: new_page_topic_edges}}, lastGoogleUpdate: Date.now()});

  return pages;
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

async function get_pages_edges_data_from_topic(topic, userID)
{
  var pages=[];

  var edge_selections =`
    page
    order_index_by_google
    lastCalculated
    num_of_links_in_page
    jaccard_similarity
    liked_positive_points
    liked_negative_points
    `
  var page_selections=`
    pageURL
    pageFormatedURL
    pageSnap
    domain
    liked_positive_points
    liked_negative_points
    credibility_positive_points
    credibility_negative_points
    educational_positive_points
    educational_negative_points
    `
  if (userID == "")
    var edges_to_pages = await Page_topic_edge.find({topic: topic})
    .select(edge_selections)
    .populate({
      path: 'page',
      select: page_selections,
      populate: {
        path: 'domains',
        select: `
                domainURL
                liked_positive_points
                liked_negative_points
                credibility_positive_points
                credibility_negative_points
                educational_positive_points
                educational_negative_points
                `
      }
    });
  else
  {
    var user_ranking_selection = `
    rank_type
    rankCode
    `
    edge_selections+= `usersRanking`;
    page_selections+= `edges_usersRanking page_usersRanking`;
    var edges_to_pages = await Page_topic_edge.find({topic: topic})
      .select(edge_selections)
      .populate([
        {
          path: 'page',
          select: page_selections,
          populate: 
          [{
            path: 'page_usersRanking',
            select: user_ranking_selection,
            match: { user: userID}
          },
          {
            path: 'edges_usersRanking',
            select: user_ranking_selection,
            match: { user: userID}
          },
          {
            path: 'domain',
            select: `
                    domainURL
                    liked_positive_points
                    liked_negative_points
                    credibility_positive_points
                    credibility_negative_points
                    educational_positive_points
                    educational_negative_points
                    `
          }]
        },
        {
          path: 'usersRanking',
          match: { user: userID },
          select: user_ranking_selection
        }]
      );
    }

  edges_to_pages.forEach(edge_to_page => {
    if (userID != "")
    {
      var user_rankings = edge_to_page.usersRanking;
      edge_to_page.page.page_usersRanking.forEach(ranking => {
        user_rankings.push(ranking);
      });
    }
    else
      var user_rankings = [];
    var page = edge_to_page.page;
    pages.push({
      pageID: page._id,
      edgeID: edge_to_page._id,
      pageURL: page['pageURL'],
      pageFormatedURL: page['pageFormatedURL'],
      pageSnap: page['pageSnap'],
      domain: page['domain'],
      user_rankings: user_rankings,
      liked_positive_points: edge_to_page.liked_positive_points,
      liked_negative_points: edge_to_page.liked_negative_points,
      credibility_positive_points: page.credibility_positive_points,
      credibility_negative_points: page.credibility_negative_points,
      educational_positive_points: page.educational_positive_points,
      educational_negative_points: page.educational_negative_points,
      order_index_by_google: edge_to_page.order_index_by_google
    });
  });
  
  return pages;
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
      return res.status(200).send(await get_pages_edges_data_from_topic(topic, userID));

    //Topic needs to be google searched again
    pages= await search_Google_and_orgenize(topic);
    return res.status(200).send(await get_pages_edges_data_from_topic(topic, userID));
  }

  //New topic
  topic={topicName:search};
  const {error}=validate_topic(topic);
  if (error) return res.status(400).send(error.details[0].message);
  topic=new Topic({topicName: search});
  topic = await topic_save(topic);
  if (userID!="")
    {
      var search=new Search({topic: topic._id})
      await User.updateOne({_id: userID}, {$push: {searches: search}});
    }
  pages= await search_Google_and_orgenize(topic);
  return res.status(200).send(await get_pages_edges_data_from_topic(topic, userID));
});
module.exports = router;