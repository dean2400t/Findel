const {Site} = require('../models/sites');
const {Topic} = require('../models/topics');
const {SiteTopicEdge} = require('../models/siteTopicEdges');
const {TopicTopicEdge} = require('../models/topic_to_topic_edges');
const {Domain} = require('../models/domains');
const {Comment} = require('../models/comments');
module.exports=async function get_collection_from_collection_name(collection_name)
{
    if (collection_name == "comments")
        return Comment;
    if (collection_name == "domains")
        return Domain;
    if (collection_name == "site-topic-edges")
        return SiteTopicEdge;
    if (collection_name == "sites")
        return Site;
    if (collection_name == "topic-topic-edges")
        return TopicTopicEdge;
    if (collection_name == "topics")
        return Topic;
    return null;
}