const {Site} = require('../models/sites');
const {Topic} = require('../models/topics');
const {SiteTopicEdge} = require('../models/siteTopicEdges');
const parseDomain = require("parse-domain");
const webScrapeURL=require('../middleware/webScrape');

var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
    var siteID=req.query.siteID;
    var edgeID = req.query.edgeID;
    var force_scrape=req.query.force_scrape;
    
    var topic=await Topic.findOne({topicName: topic});
    
    var site = await Site.findById(siteID);
    if (!site)
        return res.status(400).send("Site not in database");
    var edge= await SiteTopicEdge.findById(edgeID);
    if (!edge)
        return res.status(400).send("Topic to Site edge not in database");

    var url = site.siteURL
    if (edge.lastCalculated != null && force_scrape == false)
    {
        var lastCalculated=new Date() - edge.lastCalculated;
        var numOfDaysToLive=2;
        if (lastCalculated <= numOfDaysToLive*86400000)
            return res.status(200).send({
                is_edge_up_to_date: true,
                jaccard_similarity: edge.jaccard_similarity,
                num_of_links_in_site: edge.num_of_links_in_site
            });
    }
    else
    {
        var html=await webScrapeURL(url);
        if (html!="")
            return res.status(200).send({is_edge_up_to_date: false, siteHTML: html});
        else
            return res.status(404).send("Page can't be scraped");
    }
    return res.status(404).send("Page can't be scraped");
});
module.exports = router;