const {Page} = require('../models/pages');
const {Topic} = require('../models/topics');
const {Page_topic_edge} = require('../models/page_topic_edges');
const webScrapeURL=require('../middleware/webScrape');

var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
    var pageID=req.query.pageID;
    var edgeID = req.query.edgeID;
    var force_scrape=req.query.force_scrape;
    
    var topic=await Topic.findOne({topicName: topic});
    
    var page = await Page.findById(pageID);
    if (!page)
        return res.status(400).send("Page not in database");
    var edge= await Page_topic_edge.findById(edgeID);
    if (!edge)
        return res.status(400).send("Topic to page edge not in database");

    var url = page.pageURL
    if (edge.lastCalculated != null && force_scrape == "false")
    {
        var lastCalculated=new Date() - edge.lastCalculated;
        var numOfDaysToLive=2;
        if (lastCalculated <= numOfDaysToLive*86400000)
            return res.status(200).send({
                is_edge_up_to_date: true,
                jaccard_similarity: edge.jaccard_similarity,
                num_of_links_in_page: edge.num_of_links_in_page
            });
    }
    else
    {
        var html=await webScrapeURL(url);
        if (html!="")
            return res.status(200).send({is_edge_up_to_date: false, pageHTML: html});
        else
            return res.status(404).send("Page can't be scraped");
    }
    return res.status(404).send("Page can't be scraped");
});
module.exports = router;