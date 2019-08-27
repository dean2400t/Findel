var express = require('express');
var router = express.Router();
const auth = require('../../middleware/security/auth');

const search_for_connected_topics_in_db_and_wikipedia= require('./search_for_connected_topics_in_db_and_wikipedia')
const retrieve_topic_and_connected_topics= require('./retrieve_topic_and_connected_topics');
const rank_topic_to_topic_edge= require('./rank_topic_topic_edge');
const checkAuthAndReturnUserID = require('../../middleware/checkAuthAndReturnUserID');
const {Topic_topic_edge}= require('../../models/topic_topic_edges');

router.get('/search_for_connected_topics_in_db_and_wikipedia', async function(req, res) {
    var search=req.query.search;
    var token=req.headers['findel-auth-token'];
    var userID= checkAuthAndReturnUserID(token);

    if (!search)
        return res.status(400).send("אין search כנושא לחיפוש בבקשה");
    search_for_connected_topics_in_db_and_wikipedia(search, userID, res);
});

router.get('/retrieve_topic_and_connected_topics', async function(req, res) {
    var topicName=req.query.topicName;
    var token=req.headers['findel-auth-token'];
    var userID= checkAuthAndReturnUserID(token);

    if (!topicName)
        return res.status(400).send("אין topicName בבקשה");
    retrieve_topic_and_connected_topics(topicName, userID, res);
});

router.post('/rank_topic_topic_edge', auth, async function(req, res) {
    var edgeID=req.body.edgeID;
    var rank_type = req.body.rank_type;
    var rank_code=req.body.rank_code;
    if (!edgeID)
      return res.status(400).send("No edgeID was sent");
    if (!rank_type)
      return res.status(400).send("No rank_type was sent");
    if (!rank_code && rank_code!==0)
      return res.status(400).send("No rank_code was sent");
    if (rank_code<0 || rank_code>2)
      return res.status(400).send("rank_code must be 0, 1, or 2");
    if (!Number.isInteger(rank_code))
    return res.status(400).send("rank_code must be 0, 1, or 2");

    rank_topic_to_topic_edge(edgeID, rank_type, rank_code, user._id, res);
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

router.post('/connect_topic_to_topic', auth, async function(req, res) {
  
});
module.exports = router;