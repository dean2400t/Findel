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

router.post('/insertTopicTopicEdgeScores', async function(req, res) {
  var edgeID = req.body.id_of_edge_to_update;
  var web_scrape_score = req.body.web_scrape_score;

  var date_now=new Date();
  await TopicTopicEdge.findOneAndUpdate({_id: edgeID}, 
    {web_scrape_score: web_scrape_score,
      last_web_scrape: date_now});
  return res.status(200).send("edge updated successfuly");
});
module.exports = router;