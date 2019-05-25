const jwt = require('jsonwebtoken');
const config = require('config');

var express = require('express');
const {SiteTopicEdge} = require('../models/siteTopicEdges');
const {TopicTopicEdge}=require('../models/topic_to_topic_edges');
var router = express.Router();

/* GET home page. */
router.post('/insertSiteTopicEdgeScores', async function(req, res) {
  var edgeID = req.body.edgeID
  var num_of_links_in_site= req.body.num_of_links_in_site;
  var jaccard_similarity= req.body.jaccard_similarity;
  
  await SiteTopicEdge.findByIdAndUpdate(edgeID, 
    {num_of_links_in_site: num_of_links_in_site, 
    jaccard_similarity: jaccard_similarity,
    lastCalculated: new Date()});
  return res.status(200).send("edge updated successfuly");
});

router.post('/insertTopicTopicEdgeScores', function(req, res) {
  var edges = req.body.edges;

  edges.forEach(async edge => {
    await TopicTopicEdge.findOneAndUpdate({_id: edge._id}, 
      {web_scrape_score: edge.web_scrape_score,
        last_web_scrape: Date.now()});
  });
  
  return res.status(200).send("edge updated successfuly");
});
module.exports = router;