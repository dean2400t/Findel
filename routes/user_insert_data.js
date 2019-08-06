const jwt = require('jsonwebtoken');
const config = require('config');

var express = require('express');
const {Page_topic_edge} = require('../models/page_topic_edges');
const {Topic_topic_edge}=require('../models/topic_to_topic_edges');
var router = express.Router();

/* GET home page. */
router.post('/insert_page_topic_edge_scores', async function(req, res) {
  var edgeID = req.body.edgeID
  var num_of_links_in_page= req.body.num_of_links_in_page;
  var jaccard_similarity= req.body.jaccard_similarity;
  
  await Page_topic_edge.findByIdAndUpdate(edgeID, 
    {num_of_links_in_page: num_of_links_in_page, 
    jaccard_similarity: jaccard_similarity,
    lastCalculated: new Date()});
  return res.status(200).send("edge updated successfuly");
});

router.post('/insert_topic_topic_edges_Scores', function(req, res) {
  var edges = req.body.edges;
  
  edges.forEach(async edge => {
    await Topic_topic_edge.findOneAndUpdate({_id: edge._id}, 
      {web_scrape_score: edge.web_scrape_score,
        last_web_scrape: Date.now()});
  });
  return res.status(200).send("edge updated successfuly");
});
module.exports = router;