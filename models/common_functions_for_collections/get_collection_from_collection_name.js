const {Page} = require('../pages');
const {Topic} = require('../topics');
const {Page_topic_edge} = require('../page_topic_edges');
const {Topic_topic_edge} = require('../topic_topic_edges');
const {Domain} = require('../domains');
const {Comment} = require('../comments');
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