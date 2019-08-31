var express = require('express');
var router = express.Router();
const auth = require('../../middleware/security/auth');

const checkAuthAndReturnUserID=require('../../middleware/checkAuthAndReturnUserID');
const {Page_topic_edge}= require('../../models/page_topic_edges');

const help = require('./help');
const update_and_retrieve_topic_to_pages_edges_using_google= require('./update_and_retrieve_topic_to_pages_edges_using_google');
const rank_page_topic_edge= require('./rank_page_topic_edge');
const connect_page_to_topic= require('./connect_page_to_topic');
const web_scrape= require('./web_scrape');

router.get('/help', function(req, res) {
  return res.status(200).send(help());
});

router.get('/update_and_retrieve_topic_to_pages_edges_using_google', async function(req, res) {
    var search=req.query.search;
    var force_google_search= req.query.force_google_search;
    if (force_google_search != true)
      force_google_search == false
    var token=req.headers['findel-auth-token'];
    var userID= checkAuthAndReturnUserID(token);
    return await update_and_retrieve_topic_to_pages_edges_using_google(search, force_google_search, userID, res);
  });

router.post('/rank_page_topic_edge', auth, async function(req, res) {

  var edgeID=req.body.edgeID;
  var rank_type = req.body.rank_type;
  var rank_code=req.body.rank_code;
  var userID= req.user._id;
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
  
  return await rank_page_topic_edge(edgeID, rank_type, rank_code, userID, res)
});

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

router.post('/connect_page_to_topic', auth, async function(req, res) {
  
  var topicName=req.body.topicName;
  var pageDescription = req.body.pageDescription;
  var pageURL=decodeURI(req.body.pageURL);
  if (!topicName)
      return res.status(400).send("אין נושא בגוף הבקשה");
  if (topicName=="")
      return res.status(400).send("אין נושא בגוף הבקשה");
  if (!pageURL)
      return res.status(400).send("אין אתר בגוף הבקשה");
  if (pageURL.length<10)
      return res.status(400).send("אתר חייב להכיל יותר מ10 אותיות");
  
  return await connect_page_to_topic(topicName, pageURL, pageDescription, req.user._id, res)
});

router.get('/web_scrape', async function(req, res) {
  var edgeID = req.query.edgeID;
  var force_scrape=req.query.force_scrape;

  if (!edgeID)
    return res.status(400).send("אין edgeID בגוף הבקשה");
  
  if (force_scrape != true)
    force_scrape=false;

  return await web_scrape(edgeID, force_scrape, res);
});
module.exports = router;