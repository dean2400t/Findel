var express = require('express');
const auth = require('../middleware/security/auth');
const {User} = require('../models/users');
const {Topic} = require('../models/topics');
const {Site} = require('../models/sites');
const {SiteTopicEdge}=require('../models/siteTopicEdges');
const parseDomain = require("parse-domain");
const {Domain} = require('../models/domains');
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

    var is_site_or_topic_new=false;
    var site= await Site.findOne({siteURL: siteURL});
    if (!site)
    {
        site=new Site({siteURL: siteURL, siteFormatedURL: siteFormatedURL, siteSnap:siteDescription, domain});
        var site_domainURL = parseDomain(site.siteURL);
        site_domainURL = site_domainURL.domain + '.' + site_domainURL.tld;
        var domain = await Domain.findOne({domainURL: site_domainURL});
        if (!domain)
        {
            domain = new Domain({domainURL: site_domainURL, score: 1});
            domain.sites.push(site._id);
            await domain.save();
        }
        else
            await Domain.findByIdAndUpdate(domain._id, {$push: {sites: site}})
        site.domain = domain._id
        is_site_or_topic_new=true;
    }

    var topic= await Topic.findOne({topicName: topicName})
    if (!topic)
    {
        topic=new Topic({topicName: topicName});
        is_site_or_topic_new=true;
    }
    
    var site_topic_edge;
    if (!is_site_or_topic_new)
    {
        site_topic_edge= await SiteTopicEdge.findOne({$and: [{topic: topic._id}, {site: site._id}]});
        if (site_topic_edge)
        {
            var msg="קיים חיבור בין " + topic.topicName + " ל" + site.siteURL;
            return res.status(400).send(msg)
        }
    }

    var weight=user.userScore+1;
    site_topic_edge=new SiteTopicEdge({topic: topic._id, site: site._id, weight: weight});
    site.siteTopicEdges.push(site_topic_edge._id);
    topic.siteTopicEdges.push(site_topic_edge._id);
    user.site_Topic_Edges_Added.push(site_topic_edge._id);
    await site_topic_edge.save();
    await site.save();
    await topic.save();
    await user.save();
    var msg="נוצר חיבור בין " + topic.topicName + " ל" + site.siteURL;
    return res.status(200).send(msg);
});

module.exports = router;