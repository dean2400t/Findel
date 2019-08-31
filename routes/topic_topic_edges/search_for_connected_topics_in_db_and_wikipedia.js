const {Topic} = require('../../models/topics');
const {Search} = require('../../models/searches');
const {User} =require('../../models/users');
const {topic_save}= require('../../models/common_functions_for_collections/save_securely_to_database');

const {topic_selection}= require('../../models/common_fields_selection/topic_selections');

var wtf = require('wtf_wikipedia');
var extractAmbigiousFromText =require ("./extractAmbigiousFromText");

const retrieve_topic_and_connected_topics= require('./retrieve_topic_and_connected_topics');
const update_connected_topics_using_wikipidias_links= require('./update_connected_topics_using_wikipidias_links');

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

async function get_topic_and_connected_topics_edges_for_search(topic, userID)
{
    
    var topic= await retrieve_topic_and_connected_topics(topic.topicName, userID, null);

    var edges_to_topics=topic.topic_topic_edges;
    edges_to_topics.forEach(edge => {
        var is_search_required=true;
        if (edge.last_web_scrape!=null)
        {
            var last_web_scrape=new Date() - edge.last_web_scrape;
            var numOfDaysToLive=3;
            if (last_web_scrape<numOfDaysToLive*86400000)
                is_search_required=false;
        }
        edge.is_search_required= is_search_required;
    });
    
    return topic;
}

module.exports= async function search_for_connected_topics_in_db_and_wikipedia(search, userID, res)
{
    var topic=await Topic.findOne({topicName: search})
    .select(topic_selection())
    .lean();
    if (!topic)
    {
        topic = new Topic({topicName: search});
        topic = await topic_save(topic)
    }

    if (userID)
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
            //update database with links from wikipedia
            var links_name_array = remove_duplicate_wikipedia_links(links);
            await update_connected_topics_using_wikipidias_links(topic, links_name_array);
            var topic = await get_topic_and_connected_topics_edges_for_search(topic, null);
            topic.wikiText=doc.text();
            return res.status(200).send(topic);
        }
        else
        if (doc.templates()!=null)
        {
            //ambiguous content. returns array of possible content
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
    
    //no data from wikipedia. return topic with connected topics from database
    return res.status(200).send(await get_topic_and_connected_topics_edges_for_search(topic, null));
}