var express = require('express');
const auth = require('../middleware/security/auth');
const {User} = require('../models/users');
const {Topic} = require('../models/topics');
const {Page} = require('../models/pages');
const {Page_topic_edge}=require('../models/page_topic_edges');
const {Comment} = require('../models/comments');
const {page_save, 
       add_and_update_domain, 
       topic_save,
       page_to_topic_edge_save,
       comment_save} = require('../middleware/save_securely_to_database');
const get_collection_from_collection_name = require('../middleware/get_collection_from_collection_name');

var router = express.Router();

router.post('/add_page', auth, async function(req, res) {
  
    var topicName=req.body.topicName;
    var pageFormatedURL=decodeURI(req.body.pageURL);
    var pageDescription = req.body.pageDescription;
    var pageURL=encodeURI(pageFormatedURL);
    if (!topicName)
        return res.status(400).send("אין נושא בגוף הבקשה");
    if (topicName=="")
        return res.status(400).send("אין נושא בגוף הבקשה");
    if (!pageURL)
        return res.status(400).send("אין אתר בגוף הבקשה");
    if (pageURL.length<10)
        return res.status(400).send("אתר חייב להכיל יותר מ10 אותיות");
    var user=await User.findById(req.user._id);
    if (!user)
        return res.status(400).send("User not found in database");

    var page= await Page.findOne({pageURL: pageURL});
    if (!page)
    {
        page=new Page({pageURL: pageURL, pageFormatedURL: pageFormatedURL, pageSnap:pageDescription, domain});
        page = await page_save(page);
        page = await add_and_update_domain(page);
    }

    var topic= await Topic.findOne({topicName: topicName})
    if (!topic)
    {
        topic=new Topic({topicName: topicName});
        topic = await topic_save(topic);
    }

    var page_topic_edge= await Page_topic_edge.findOne({$and: [{topic: topic._id}, {page: page._id}]});
    if (page_topic_edge)
    {
        var msg="קיים חיבור בין " + topic.topicName + " ל" + page.pageURL;
        return res.status(400).send(msg)
    }

    var weight=user.userScore+1;
    page_topic_edge=new Page_topic_edge({topic: topic._id, page: page._id, weight: weight});
    page_topic_edge = await page_to_topic_edge_save(page_topic_edge);
    await Page.updateOne({_id: page._id}, {$addToSet: {page_topic_edges: page_topic_edge._id}});
    await Topic.findOneAndUpdate({_id: topic._id}, {$addToSet: {page_topic_edges: page_topic_edge._id}});
    await User.findOneAndUpdate({_id: user._id}, {$addToSet: {page_topic_edges_added: page_topic_edge._id}});
    var msg="נוצר חיבור בין " + topic.topicName + " ל" + page.pageURL;
    return res.status(200).send(msg);
});

router.post('/addComment', auth, async function(req, res) {
  
    var text=req.body.text;
    var object_id = req.body.object_id;
    var collection_name = req.body.collection_name;
    var root_comment_id = req.body.root_comment_id;

    if (!text)
        return res.status(400).send("אין טקסט בגוף הבקשה");
    if (object_id=="")
        return res.status(400).send("אין ID של אובייקט בגוף הבקשה");
    if (!collection_name)
        return res.status(400).send("אין לאיזה ספריית אובייקטים לשמור בגוף הבקשה");
    
    var user=await User.findById(req.user._id);
    if (!user)
        return res.status(400).send("User not found in database");

    var collection = await get_collection_from_collection_name(collection_name);
    if (!collection)
        return res.status(400).send("collection name is incorrect");

    var object_to_comment = await collection.findById(object_id);
    if (!object_to_comment)
        return res.status(400).send("Object with this ID does not exist in this collection");
    
    if (!root_comment_id)
    {
        var comment = new Comment({
            text: text,
            object_id: object_id,
            object_id_collection_name: collection_name,
            user: user._id
        });
        comment.root_comment=comment._id;
        if (await comment_save(comment))
        {
            await collection.findOneAndUpdate({_id: object_id}, {$addToSet: {root_comments: comment._id}});
            await User.findOneAndUpdate({_id: user._id}, {$addToSet: {comments_added: comment._id}});
            return res.status(200).send(comment);
        }
    }
    else
    {
        var root_comment = await Comment.findById(root_comment_id)
        if (!root_comment)
            return res.status(400).send("Root comment not found in database");
        
        var comment = new Comment({
            text: text,
            object_id: object_id,
            object_id_collection_name: collection_name,
            user: user._id,
            root_comment: root_comment_id
        });
        
        if (await comment_save(comment))
        {
            await User.findOneAndUpdate({_id: user._id}, {$addToSet: {comments_added: comment._id}});
            return res.status(200).send(comment);
        }
    }
    return res.status(500).send("comment not saved");
});

module.exports = router;