const {page_topic_edges_selection}= require('../../models/common_fields_selection/page_topic_edges_selections');
const {topic_selection}= require('../../models/common_fields_selection/topic_selections');
const {page_selection, page_populate}= require('../../models/common_fields_selection/page_selections');
const {domain_populate}= require('../../models/common_fields_selection/domain_selections');
const {rankings_populate}= require('../../models/common_fields_selection/rankings_selections');

const {Topic, validate_topic} = require('../../models/topics');
const {Page_topic_edge} = require('../../models/page_topic_edges');
const {Page} = require('../../models/pages');
const {Ranking}= require('../../models/rankings');
const googleSearch=require('./googleSearch');
const {add_and_update_domain, 
       page_to_topic_edge_save,
       page_save,
       topic_save} = require('../../models/common_functions_for_collections/save_securely_to_database');
const {User} = require('../../models/users');
const {Search}=require('../../models/searches');

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
    pages_in_database=await Page.find({pageURL: { $in: pages_from_google }}).sort({pageURL:1})
    .select(page_selection());
    var new_pages_to_add=find_which_pages_are_not_in_DataBase(pages, pages_in_database);
    
    for (var new_page_index=0; new_page_index< new_pages_to_add.length; new_page_index++)
    {
      var new_page= new_pages_to_add[new_page_index];
      var new_page=new Page({pageURL: new_page.pageURL,
        pageSnap:  new_page.snippet
      });
      new_page = await page_save(new_page);
      if (!new_page)
        console.log("fatal page save error");
      else
      {
        new_page = await add_and_update_domain(new_page);
        pages_in_database.push(new_page);
      }
    };
  }
  return pages_in_database;
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

async function filter_already_connected_pages_in_database(topic, pages_in_database, pages_from_google, topic)
{
  var topic_to_pages_edges = await retrieve_topic_to_pages_edges_from_topic(topic, null)
  if (topic_to_pages_edges.length > 0)
  {
    var already_connected_edges= topic_to_pages_edges;
    already_connected_edges.sort((edge1, edge2) => {if (edge2.page.pageURL>edge1.page.pageURL) return -1; else return 1;});
    
    var pages_in_db_which_are_not_connected=[];

    for (var index = 0; index < pages_in_database.length; index++)
    {
      var page_in_database= pages_in_database[index]
      var connected_edge = binary_find_page_in_edges_by_url(already_connected_edges, page_in_database, 0, already_connected_edges.length-1);
      if (!connected_edge)
        pages_in_db_which_are_not_connected.push(page_in_database);
      else
        {
          //updating order_index_by_google of edge
          var page_from_google=binary_find_page_in_pages_by_url(pages_from_google, connected_edge.page,0, pages_from_google.length-1);
          if (!page_from_google)
            page_from_google={order_index_by_google: null};
          await Page_topic_edge.findByIdAndUpdate(connected_edge._id, {order_index_by_google: page_from_google.order_index_by_google});
        }
    };
    return pages_in_db_which_are_not_connected;
  }
  else
    return pages_in_database;
}
/*
Function searches google by topic and update database accordingly
*/
async function search_Google_and_organize(topic)
{
  var search=topic.topicName;
  var pages_from_google=await googleSearch(search, 2);
  pages_in_database = await add_new_pages_and_return_pages_from_database(pages_from_google);
  var pages_in_db_which_are_not_connected= await filter_already_connected_pages_in_database(topic, pages_in_database, pages_from_google, topic);

  //Build edges for current topic to found google pages
  var edge;
  var new_page_topic_edges=[];

  for (var index=0; index< pages_in_db_which_are_not_connected.length; index++)
  {
    not_connected_page_in_db= pages_in_db_which_are_not_connected[index];
    var page_from_google=binary_find_page_in_pages_by_url(pages_from_google, not_connected_page_in_db,0, pages_from_google.length-1);
    if (!page_from_google)
      page_from_google={order_index_by_google: null};
    edge = new Page_topic_edge({page: not_connected_page_in_db._id, topic: topic._id, order_index_by_google: page_from_google.order_index_by_google});
    edge = await page_to_topic_edge_save(edge);
    if (edge)
    {
      new_page_topic_edges.push(edge._id);
      await Page.updateOne({_id: not_connected_page_in_db.id}, {$addToSet: {page_topic_edges: edge._id}});
    }
  }

  if (new_page_topic_edges.length>0)
    await Topic.findOneAndUpdate({_id: topic._id}, {$addToSet: {page_topic_edges: {$each: new_page_topic_edges}}, lastGoogleUpdate: Date.now()});
}

async function retrieve_topic_to_pages_edges_from_topic(topic, userID)
{

    var topic_to_pages_edges = await Page_topic_edge.find({topic: topic._id})
      .select(page_topic_edges_selection({userID: userID}))
      .populate(
          page_populate({
            userID: userID,
            populate:[domain_populate()]
          })
      )
      .populate(rankings_populate(
        {
          userID: userID,
          object_collection_name: 'page-topic-edges'
        }))
      .lean();

  return topic_to_pages_edges;
}

module.exports = async function update_and_retrieve_topic_to_pages_edges(search, force_google_search, userID, res)
{
    var topic=await Topic.findOne({topicName: search})
    .select(topic_selection())
    .lean();
  
    if (topic)
    {
      var googleSearchAge=new Date() - topic.lastGoogleUpdate;
      var numOfDaysToLive=3;
  
      //Topic was google searched recently
      if(googleSearchAge<numOfDaysToLive*86400000 && force_google_search==false)
        return res.status(200).send(await retrieve_topic_to_pages_edges_from_topic(topic, userID));
  
      //Topic needs to be google searched again
      await search_Google_and_organize(topic);
      return res.status(200).send(await retrieve_topic_to_pages_edges_from_topic(topic, userID));
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
    await search_Google_and_organize(topic);
    return res.status(200).send(await retrieve_topic_to_pages_edges_from_topic(topic, userID));
}
