const checkAuthAndReturnUserID=require('../../middleware/checkAuthAndReturnUserID');
const update_and_retrieve_topic_to_pages_edges= require('./update_and_retrieve_topic_to_pages_edges');
const rank_page_to_topic_edge= require('./rank_page_to_topic_edge');
const connect_page_to_topic= require('./connect_page_to_topic');
const {Page_topic_edge}= require('../../models/page_topic_edges');

router.get('/update_and_retrieve_topic_to_pages_edges', async function(req, res) {
    var search=req.query.search;
    var token=req.headers['findel-auth-token'];
    var userID= checkAuthAndReturnUserID(token);
    return update_and_retrieve_topic_to_pages_edges(search, userID, res);
  });

router.post('/rank_page_topic_edge', auth, async function(req, res) {

  var edgeID=req.body.edgeID;
  var rank_type = req.body.rank_type;
  var rankCode=req.body.rankCode;
  var userID= req.user._id;
  if (!edgeID)
    return res.status(400).send("No edgeID was sent");
  if (!rank_type)
    return res.status(400).send("No rank_type was sent");
  if (!rankCode && rankCode!==0)
    return res.status(400).send("No rank_code was sent");
  if (rankCode<0 || rankCode>2)
    return res.status(400).send("rankCode must be 0, 1, or 2");
  if (!Number.isInteger(rankCode))
  return res.status(400).send("rankCode must be 0, 1, or 2");
  
  rank_page_to_topic_edge(edgeID, userID, res)
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
  
  return connect_page_to_topic(topicName, pageURL, pageDescription, user._id)
});
module.exports = router;