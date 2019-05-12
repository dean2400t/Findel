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

function binary_find_topicIndex_in_topicsId_array(connected_topics, topic_id, start, end) {
    // Base Condtion 
    if (start > end) return null; 
   
    // Find the middle index 
    let mid=Math.floor((start + end)/2); 
   
    // Compare mid with given key x 
    if (connected_topics[mid]._id.equals(topic_id)) return mid; 
          
    // If element at mid is greater than x, 
    // search in the left half of mid 
    if(connected_topics[mid]._id > topic_id)  
        return binary_find_topicIndex_in_topicsId_array(connected_topics, topic_id, start, mid-1); 
    else
        // If element at mid is smaller than x, 
        // search in the right half of mid 
        return binary_find_topicIndex_in_topicsId_array(connected_topics, topic_id, mid+1, end); 
  
}

function binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, start, end) { 
       
    // Base Condtion 
    if (start > end) return null; 
   
    // Find the middle index 
    let mid=Math.floor((start + end)/2); 
   
    // Compare mid with given key x 
    if (topics_and_edges_array[mid].topic.topicName===link_name) return topics_and_edges_array[mid]; 
          
    // If element at mid is greater than x, 
    // search in the left half of mid 
    if(topics_and_edges_array[mid].topic.topicName > link_name)  
        return binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, start, mid-1); 
    else
  
        // If element at mid is smaller than x, 
        // search in the right half of mid 
        return binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, mid+1, end); 
  }
async function get_topics_and_edges_from_topic_to_topic_edges(topic, userID)
{
    var topicTopicEdges = await TopicTopicEdge.find({$or: [{ topic1: topic }, { topic2: topic } ]}).sort();
    var connnected_topic_ids_array=[];
    var connected_topics_ids_and_edges=[];
    topicTopicEdges.forEach(edge => {
        var connnected_topic_id=edge.topic1;
        if (topic._id.equals(edge.topic1))
            connnected_topic_id=edge.topic2;
        connnected_topic_ids_array.push(connnected_topic_id);
        connected_topics_ids_and_edges.push({topic_id: connnected_topic_id, edge: edge});
    });
    var topics_and_edges_array=[];
    var connnected_topics=await Topic.find({_id: { $in: connnected_topic_ids_array}}).sort();
    connected_topics_ids_and_edges.forEach(connected_topicID_and_edge => {
        var index=binary_find_topicIndex_in_topicsId_array(connnected_topics, connected_topicID_and_edge.topic_id, 0, connnected_topics.length-1)
        if (index)
            topics_and_edges_array.push({topic: connnected_topics[index], edge: connected_topicID_and_edge.edge});

    });
    topics_and_edges_array.sort((topics_and_edges_array_1, topics_and_edges_array_2)=>{
        if (topics_and_edges_array_1.topic.topicName>topics_and_edges_array_2.topic.topicName)
            return 1;
        else
            return -1;
        });

    if (userID!="")
        topics_and_edges_array.forEach(topics_and_edges => {
            var edge= topics_and_edges.edge;
            for (var rankIndex=0; rankIndex<edge.usersRanking.length; rankIndex++)
                if (edge.usersRanking[rankIndex].userID.equals(userID))
                {
                    userRankCode=edge.usersRanking[rankIndex].rankCode;
                    if (userRankCode==1)
                    edge.weight-=edge.usersRanking[rankIndex].scoreAdded-1;
                    if (userRankCode==2)
                    edge.weight+=edge.usersRanking[rankIndex].scoreAdded-1;
                }
        });

    return topics_and_edges_array;
}

async function update_wikipidia_links_on_topic_and_return_connected_topics(topic, links_name_array, userID){
    if (topic.last_wikipidia_search!=null)
  {
    var last_wikipidia_search=new Date() - topic.last_wikipidia_search;
    var numOfDaysToLive=1;
    if (last_wikipidia_search<numOfDaysToLive*86400000)
    {
      is_search_requiered=false;
      return [await get_topics_and_edges_from_topic_to_topic_edges(topic, userID), is_search_requiered];
    }
  }
  var topics_and_edges_array= await get_topics_and_edges_from_topic_to_topic_edges(topic, userID);
  var topic_and_edge_in_array=null;
  var new_topics_array=[];
  var new_edges_array=[];
  var full_topics_and_edges_array=[];
  if (topics_and_edges_array.length>0)
      links_name_array.forEach(link_name => {
          topic_and_edge_in_array = binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, 0, topics_and_edges_array.length-1);
          if (!topic_and_edge_in_array)
          {
              var newTopic=new Topic({topicName: link_name});
              var new_topic_to_topic_edge=new TopicTopicEdge({topic1: topic._id, topic2: newTopic._id, weight: 1});
              topic.topicTopicEdges.push(new_topic_to_topic_edge);
              newTopic.topicTopicEdges.push(new_topic_to_topic_edge);
              new_topics_array.push(newTopic);
              new_edges_array.push(new_topic_to_topic_edge);
              full_topics_and_edges_array.push({topic: newTopic, edge: new_topic_to_topic_edge});
          }
          else
            full_topics_and_edges_array.push(topic_and_edge_in_array);
      });
    else
        links_name_array.forEach(link_name => {
            var newTopic=new Topic({topicName: link_name});
            var new_topic_to_topic_edge=new TopicTopicEdge({topic1: topic._id, topic2: newTopic._id, weight: 1});
            topic.topicTopicEdges.push(new_topic_to_topic_edge);
            newTopic.topicTopicEdges.push(new_topic_to_topic_edge);
            new_topics_array.push(newTopic);
            new_edges_array.push(new_topic_to_topic_edge);
            full_topics_and_edges_array.push({topic: newTopic, edge: new_topic_to_topic_edge});
        });
    Topic.insertMany(new_topics_array);
    TopicTopicEdge.insertMany(new_edges_array);
    topic.last_wikipidia_search=new Date();
    await topic.save();
    is_search_requiered=true;
    return [full_topics_and_edges_array, is_search_requiered];
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
            var [full_topics_and_edges_array, is_search_required] = await update_wikipidia_links_on_topic_and_return_connected_topics(topic, links_name_array, userID);
            var wikiText=doc.text();
            return res.status(200).send({connected_topics_and_edges: full_topics_and_edges_array, wikiText: wikiText, is_search_required: is_search_required});
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
       
    var topic_topic_data= await get_topics_and_edges_from_topic_to_topic_edges(topic, userID);
    return res.status(200).send({connected_topics_and_edges: topic_topic_data});
    
});
module.exports = router;