const {Page} = require('../models/pages');
const {Topic} = require('../models/topics');
const {Page_topic_edge} = require('../models/page_topic_edges');
const {Topic_topic_edge} = require('../models/topic_to_topic_edges');
const {Domain} = require('../models/domains');
const {Comment} = require('../models/comments');
module.exports=async function get_collection_from_collection_name(collection_name)
{
    if (collection_name == "comments")
        return Comment;
    if (collection_name == "domains")
        return Domain;
    if (collection_name == "page-topic-edges")
        return Page_topic_edge;
    if (collection_name == "pages")
        return Page;
    if (collection_name == "topic-topic-edges")
        return Topic_topic_edge;
    if (collection_name == "topics")
        return Topic;
    return null;
}