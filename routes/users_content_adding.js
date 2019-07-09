var express = require('express');
const auth = require('../middleware/security/auth');
const {User} = require('../models/users');
const {Topic} = require('../models/topics');
const {Site} = require('../models/sites');
const {SiteTopicEdge}=require('../models/siteTopicEdges');
const {site_save, 
       add_and_update_domain, 
       topic_save,
       site_to_topic_edge_save} = require('../middleware/save_securely_to_database');

var router = express.Router();

router.post('/addSite', auth, async function(req, res) {
  
    var topicName=req.body.topicName;
    var siteFormatedURL=decodeURI(req.body.siteURL);
    var siteDescription = req.body.siteDescription;
    var siteURL=encodeURI(siteFormatedURL);
    if (!topicName)
        return res.status(400).send("אין נושא בגוף הבקשה");
    if (topicName=="")
        return res.status(400).send("אין נושא בגוף הבקשה");
    if (!siteURL)
        return res.status(400).send("אין אתר בגוף הבקשה");
    if (siteURL.length<10)
        return res.status(400).send("אתר חייב להכיל יותר מ10 אותיות");
    var user=await User.findById(req.user._id);
    if (!user)
        return res.status(400).send("User not found in database");

    var site= await Site.findOne({siteURL: siteURL});
    if (!site)
    {
        site=new Site({siteURL: siteURL, siteFormatedURL: siteFormatedURL, siteSnap:siteDescription, domain});
        site = await site_save(site);
        site = await add_and_update_domain(site);
    }

    var topic= await Topic.findOne({topicName: topicName})
    if (!topic)
    {
        topic=new Topic({topicName: topicName});
        topic = await topic_save(topic);
    }

    var site_topic_edge= await SiteTopicEdge.findOne({$and: [{topic: topic._id}, {site: site._id}]});
    if (site_topic_edge)
    {
        var msg="קיים חיבור בין " + topic.topicName + " ל" + site.siteURL;
        return res.status(400).send(msg)
    }

    var weight=user.userScore+1;
    site_topic_edge=new SiteTopicEdge({topic: topic._id, site: site._id, weight: weight});
    site_topic_edge = await site_to_topic_edge_save(site_topic_edge);
    await Site.updateOne({_id: site._id}, {$addToSet: {siteTopicEdges: site_topic_edge._id}});
    await Topic.findOneAndUpdate({_id: topic._id}, {$addToSet: {siteTopicEdges: site_topic_edge._id}});
    await User.findOneAndUpdate({_id: user._id}, {$addToSet: {site_Topic_Edges_Added: site_topic_edge._id}});
    var msg="נוצר חיבור בין " + topic.topicName + " ל" + site.siteURL;
    return res.status(200).send(msg);
});

module.exports = router;