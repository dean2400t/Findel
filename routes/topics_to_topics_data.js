var express = require('express');
const {Topic, validateTopic} = require('../models/topics');
const {TopicTopicEdges} = require('../models/topic_to_topic_edges');
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
        for (var index=1; index<links.length; index++)
            if (links[index-1].page===links[index].page)
            {
                links.splice(index,1);
                index--;
            }
    }

function binary_search_topicTopicEdge_in_topic(edges_in_topic, edge_in_db, start, end) { 
       
    // Base Condtion 
    if (start > end) return null; 
   
    // Find the middle index 
    let mid=Math.floor((start + end)/2); 
   
    // Compare mid with given key x 
    if (edges[mid].site.equals(site._id)) return edges[mid]; 
          
    // If element at mid is greater than x, 
    // search in the left half of mid 
    if(edges[mid].site > site._id)  
        return binary_search_topicTopicEdge_in_topic(edges, site, start, mid-1); 
    else
  
        // If element at mid is smaller than x, 
        // search in the right half of mid 
        return binary_search_topicTopicEdge_in_topic(edges, site, mid+1, end); 
  }
async function get_topics_data_from_topic_to_topic_edges(topic)
{
    var topicTopicEdges = await TopicTopicEdges.find({$or: [{ topic1: topic }, { topic2: topic } ]}).sort;
    var connnected_topic_ids_array=[];
    topicTopicEdges.forEach(edge => {
        var connnected_topic_id=edge.topic1;
        if (topic._id.equals(topic1))
            connnected_topic_id=edge.topic2;
        connnected_topic_ids_array.push(connnected_topic_id);
    });
    var topicsIDs= topic.topicTopicEdges;
    var newTopicsArray=[];
    if (topicEdges)
        for (var edgeIndex=0; edgeIndex<topicTopicEdges.length; edgeIndex++)
        {
            binary_search_topicTopicEdge_in_topic(topic)
        }
    
}

async function update_wikipidia_links_on_topic(topic){
  if (topic.last_wikipidia_search!=null)
  {
    var last_wikipidia_search=new Date() - topic.last_wikipidia_search;
    var numOfDaysToLive=1;
    if (last_wikipidia_search<numOfDaysToLive*86400000)
      var x=3;  
  }
}

/* GET home page. */
router.get('/', async function(req, res) {
    var search=req.query.search;
    /*
    var topic=await Topic.findOne({topicName: search});
    if (topic)
    {
        if (topic.last_wikipidia_search!=null)
            var last_wikipidia_search=new Date() - topic.last_wikipidia_search;
            var numOfDaysToLive=1;
            if (last_wikipidia_search<numOfDaysToLive*86400000)
                return res.status(200).send(await get_topics_data_from_topic_to_topic_edges(topic));
    }
    else
        topic=new Topic({topicName: search});

    */
    var doc= await wtf.fetch(search, "he").catch((error) => {
        var msg="בעיה אל מול ויקיפדיה: " + error;
        return res.status(404).send(msg)
    });
    var links;
    if (doc!=null)
    {
        links=doc.links();
        if (links.length>0)
        {

            remove_duplicate_wikipedia_links(links);
            //await update_wikipidia_links_on_topic(topic);
            return res.status(200).send({links: links});
        }
        else
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
    else
        return res.status(200).send({noLinks: "noLinks"});
    
});
module.exports = router;