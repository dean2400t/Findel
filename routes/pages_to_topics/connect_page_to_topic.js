const {Topic} = require('../../models/topics');
const {Page} = require('../../models/pages');
const {Page_topic_edge}=require('../../models/page_topic_edges');
const {page_save, 
    add_and_update_domain, 
    topic_save,
    page_to_topic_edge_save} = require('../../middleware/save_securely_to_database');
module.exports= async function connect_page_to_topic(topicName, pageURL, pageDescription, userID, res){
    var user=await User.findById(userID)
    .select('_id')
    .lean();
    if (!user)
        return res.status(400).send("User not found in database");

    var page= await Page.findOne({pageURL: pageURL})
    .select('_id')
    .lean();
    if (!page)
    {
        page=new Page({pageURL: pageURL, pageSnap:pageDescription});
        page = await page_save(page);
        page = await add_and_update_domain(page);
    }

    var topic= await Topic.findOne({topicName: topicName})
    .select('_id')
    .lean();
    if (!topic)
    {
        topic=new Topic({topicName: topicName});
        topic = await topic_save(topic);
    }

    var page_topic_edge= await Page_topic_edge.findOne({$and: [{topic: topic._id}, {page: page._id}]})
    .select('_id')
    .lean();
    if (page_topic_edge)
    {
        var msg="קיים חיבור בין " + topic.topicName + " ל" + page.pageURL;
        return res.status(400).send(msg)
    }

    page_topic_edge=new Page_topic_edge({topic: topic._id, page: page._id, added_by: user._id});
    page_topic_edge = await page_to_topic_edge_save(page_topic_edge);
    await Page.updateOne({_id: page._id}, {$addToSet: {page_topic_edges: page_topic_edge._id}});
    await Topic.findOneAndUpdate({_id: topic._id}, {$addToSet: {page_topic_edges: page_topic_edge._id}});
    var msg="נוצר חיבור בין " + topic.topicName + " ל" + page.pageURL;
    return res.status(200).send(msg);
}