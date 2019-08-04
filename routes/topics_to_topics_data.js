const jwt = require('jsonwebtoken');
const config = require('config');

var express = require('express');
const {Topic, validateTopic} = require('../models/topics');
const {topic_to_topic_edge_save, topic_save} = require('../middleware/save_securely_to_database');
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
    if (start > end) return null; 
 
    let mid=Math.floor((start + end)/2); 
    if (topics_and_edges_array[mid].topic1.topicName===link_name) return topics_and_edges_array[mid]; 
    if(topics_and_edges_array[mid].topic1.topicName > link_name)  
        return binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, start, mid-1); 
    else
        return binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, mid+1, end); 
  }

async function get_connected_topics_edges(topic, userID)
{
    
    if (userID != '')
        var connected_topics_edges = await TopicTopicEdge.find(
            {$or: [{ topic1: topic }, { topic2: topic } ]})
            .populate('topic1')
            .populate('topic2')
            .populate({
                path: 'usersRanking',
                match: { user: userID}
            });
    else
        var connected_topics_edges = await TopicTopicEdge.find(
            {$or: [{ topic1: topic }, { topic2: topic } ]})
            .populate('topic1')
            .populate('topic2');

    var edges_data=[];
    connected_topics_edges.forEach(edge => {
        if (userID != "")
        var user_rankings = edge.usersRanking;
      else
        var user_rankings = [];

        if (topic._id.equals(edge.topic1._id))
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

        edges_data.push({
            edgeID: edge._id,
            topic1: edge.topic1,
            liked_weight: edge.liked_weight,
            web_scrape_score: edge.web_scrape_score,
            is_search_required: is_search_required,
            user_rankings: user_rankings
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
  var new_edges_id_array=[];

  if (connected_topics_edges.length>0)
  {
    connected_topics_edges.sort((edge_a, edge_b) => {if (edge_b.topic1.topicName>edge_a.topic1.topicName) return 1 ; else return -1;});
    await Promise.all(links_name_array.map(async (link_name) => {
        topic_and_edge_in_array = binary_search_topic_and_edge_in_topics_and_edges_array(connected_topics_edges, link_name, 0, connected_topics_edges.length-1);
        if (!topic_and_edge_in_array)
        {
            var newTopic=new Topic({topicName: link_name});
            newTopic = await topic_save(newTopic);
            if (topic.topicName < newTopic.topicName)
                var new_topic_to_topic_edge=new TopicTopicEdge({topic1: topic._id, topic2: newTopic._id});
            else
                var new_topic_to_topic_edge=new TopicTopicEdge({topic1: newTopic._id, topic2: topic._id});

            new_topic_to_topic_edge = await topic_to_topic_edge_save(new_topic_to_topic_edge);
            if (new_topic_to_topic_edge)
            {
                await Topic.findOneAndUpdate({_id: newTopic._id}, {$addToSet: {topicTopicEdges: new_topic_to_topic_edge}});
                new_edges_id_array.push(new_topic_to_topic_edge._id);
            }
        }
    }));
  }
  else
    await Promise.all(links_name_array.map(async (link_name) => {
        var newTopic=new Topic({topicName: link_name});
        newTopic = await topic_save(newTopic);
        if (topic.topicName < newTopic.topicName)
            var new_topic_to_topic_edge=new TopicTopicEdge({topic1: topic._id, topic2: newTopic._id});
        else
            var new_topic_to_topic_edge=new TopicTopicEdge({topic1: newTopic._id, topic2: topic._id});
        new_topic_to_topic_edge = await topic_to_topic_edge_save(new_topic_to_topic_edge);
        if (new_topic_to_topic_edge)
        {
            await Topic.findOneAndUpdate({_id: newTopic._id}, {$addToSet: {topicTopicEdges: new_topic_to_topic_edge}});
            new_edges_id_array.push(new_topic_to_topic_edge._id);
        }
    }));
    if (new_edges_id_array.length>0)
        await Topic.findOneAndUpdate({_id: topic._id}, {$addToSet: {topicTopicEdges: {$each: new_edges_id_array}}, last_wikipidia_search: Date.now()});
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


router.get('/', async function(req, res) {
    var search=req.query.search;
    var token=req.headers['findel-auth-token'];
    var userID= checkAuthAndReturnUserID(token);
    var topic=await Topic.findOne({topicName: search});
    if (!topic)
    {
        topic = new Topic({topicName: search});
        topic = await topic_save(topic)
    }
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