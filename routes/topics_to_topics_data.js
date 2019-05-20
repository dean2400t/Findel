const jwt = require('jsonwebtoken');
const config = require('config');

var express = require('express');
const {Topic, validateTopic} = require('../models/topics');
const {TopicTopicEdge} = require('../models/topic_to_topic_edges');
const {Search} = require('../models/searches');
const {User} =require('../models/users');
var wtf = require('wtf_wikipedia');
var extractAmbigiousFromText =require ("../middleware/extractAmbigiousFromText");
var router = express.Router();

function remove_duplicate_wikipedia_links(links)
    {
        links.sort(function(a, b) {
            if (a.page>b.page)
                return 1;
            else
                return -1;
          });
        var links_name_array=[];
        for (var index=1; index<links.length; index++)
            if (links[index-1].page!==links[index].page && links[index-1].page!=undefined)
                links_name_array.push(links[index-1].page);
        if (links[links.length-2].page!==links[links.length-1].page && links[links.length-1].page!=undefined)
            links_name_array.push(links[links.length-1].page);
        return links_name_array
    }

function binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, start, end) { 
       
    // Base Condtion 
    if (start > end) return null; 
   
    // Find the middle index 
    let mid=Math.floor((start + end)/2); 
   
    // Compare mid with given key x 
    if (topics_and_edges_array[mid].topic1.topicName===link_name) return topics_and_edges_array[mid]; 
          
    // If element at mid is greater than x, 
    // search in the left half of mid 
    if(topics_and_edges_array[mid].topic1.topicName > link_name)  
        return binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, start, mid-1); 
    else
  
        // If element at mid is smaller than x, 
        // search in the right half of mid 
        return binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, mid+1, end); 
  }
async function get_connected_topics_edges(topic, userID)
{
    var connected_topics_edges = await TopicTopicEdge.find({$or: [{ topic1: topic }, { topic2: topic } ]}).populate('topic1').populate('topic2');
    var edges_data=[];
    connected_topics_edges.forEach(edge => {
        var connnected_topic=edge.topic1;
        if (connnected_topic._id.equals(edge.topic1._id))
            edge.topic1=edge.topic2;
        edge.topic2=null;
        var is_search_required=true;
        if (edge.last_web_scrape!=null)
        {
            var last_web_scrape=new Date() - edge.last_web_scrape;
            var numOfDaysToLive=3;
            if (last_web_scrape<numOfDaysToLive*86400000)
                is_search_required=false;
        }

        var userRankCode=0;
        if (userID!="")
        connected_topics_edges.forEach(edge => {
            userRankCode=0;
            for (var rankIndex=0; rankIndex<edge.usersRanking.length; rankIndex++)
                if (edge.usersRanking[rankIndex].userID.equals(userID))
                    userRankCode=edge.usersRanking[rankIndex].rankCode;
        });
        edges_data.push({
            edgeID: edge._id,
            topic1: edge.topic1,
            weight: edge.weight,
            web_scrape_score: edge.web_scrape_score,
            is_search_required: is_search_required,
            userRankCode: userRankCode
        
        });
    });
    
    return edges_data;
}

async function update_wikipidia_links_on_topic(topic, links_name_array, userID){
    if (topic.last_wikipidia_search!=null)
  {
    var last_wikipidia_search=new Date() - topic.last_wikipidia_search;
    var numOfDaysToLive=3;
    if (last_wikipidia_search<numOfDaysToLive*86400000)
        return
  }
  var connected_topics_edges= await get_connected_topics_edges(topic, userID);
  var topic_and_edge_in_array=null;
  var new_topics_array=[];
  var new_edges_array=[];
  if (connected_topics_edges.length>0)
  {
    connected_topics_edges.sort((edge_a, edge_b) => {if (edge_b.topic.topicName>edge_a.topic.topicName) return 1 ; else return -1;});
    links_name_array.forEach(link_name => {
        topic_and_edge_in_array = binary_search_topic_and_edge_in_topics_and_edges_array(connected_topics_edges, link_name, 0, connected_topics_edges.length-1);
        if (!topic_and_edge_in_array)
        {
            var newTopic=new Topic({topicName: link_name});
            var new_topic_to_topic_edge=new TopicTopicEdge({topic1: topic._id, topic2: newTopic._id, weight: 1, web_scrape_score: 1});
            topic.topicTopicEdges.push(new_topic_to_topic_edge);
            newTopic.topicTopicEdges.push(new_topic_to_topic_edge);
            new_topics_array.push(newTopic);
            new_edges_array.push(new_topic_to_topic_edge);
        }
    });
  }
    else
        links_name_array.forEach(link_name => {
            var newTopic=new Topic({topicName: link_name});
            var new_topic_to_topic_edge=new TopicTopicEdge({topic1: topic._id, topic2: newTopic._id, weight: 1, web_scrape_score: 1});
            topic.topicTopicEdges.push(new_topic_to_topic_edge);
            newTopic.topicTopicEdges.push(new_topic_to_topic_edge);
            new_topics_array.push(newTopic);
            new_edges_array.push(new_topic_to_topic_edge);
        });
    Topic.insertMany(new_topics_array);
    TopicTopicEdge.insertMany(new_edges_array);
    topic.last_wikipidia_search=new Date();
    await topic.save();
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

/* GET home page. */
router.get('/', async function(req, res) {
    var search=req.query.search;
    var token=req.headers['findel-auth-token'];
    var userID= checkAuthAndReturnUserID(token);
    var topic=await Topic.findOne({topicName: search});
    if (!topic)
        topic=new Topic({topicName: search});
        await topic.save();
    if (userID!="")
    {
        var user_search=new Search({topic: topic._id})
        await User.updateOne({_id: userID}, {$push: {searches: user_search}});
    }

    var doc= await wtf.fetch(search, "he").catch((error) => {
        console.log("no wikipedia value");
    });
    if (doc)
    {
        if (doc.links()!=null)
            links=doc.links();
        if (links.length>0)
        {
            var links_name_array = remove_duplicate_wikipedia_links(links);
            await update_wikipidia_links_on_topic(topic, links_name_array, userID);
            var connected_topics_edges = await get_connected_topics_edges(topic, userID);
            var wikiText=doc.text();
                return res.status(200).send({connected_topics_edges: connected_topics_edges, wikiText: wikiText});
        }
        else
        if (doc.templates()!=null)
        {
            var referTo=doc.templates();
            var ambigList=null;
            for (var index=0; index< referTo.length; index++)
            {
                if (referTo[index].list!=undefined)
                {
                    ambigList=referTo[index].list[0];
                    break;
                }
            }

            if (ambigList!=null)
            {
                var ambig=extractAmbigiousFromText(ambigList);
                return res.status(200).send({ambig: ambig});
            }
        }
    }
       
    var connected_topics_edges= await get_connected_topics_edges(topic, userID);
    return res.status(200).send({connected_topics_edges: connected_topics_edges});
    
});
module.exports = router;