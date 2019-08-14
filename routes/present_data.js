const jwt = require('jsonwebtoken');
const config = require('config');
var express = require('express');
var router = express.Router();
const {Domain} = require('../models/domains');
const {Topic} = require('../models/topics');
const {Topic_topic_edge} = require('../models/topic_to_topic_edges');
const {Page} = require('../models/pages');
const {Comments} = require('../models/comments');
const extract_comments_from_database = require('../middleware/extract_comments_from_database');

function checkAuthAndReturnUserID(token)
{
  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    return decoded._id;
  }
  catch (ex) {
    return "";
  }
}


router.get('/domains', async function(req, res) {
   var domains = await Domain.find({})
   .select(
   `liked_positive_points
   liked_negative_points
   credibility_positive_points
   credibility_negative_points 
   educational_positive_points
   educational_negative_points
   domainURL _id`
   );
   return res.status(200).send(domains);
});

router.get('/domain_pages', async function(req, res) {
   var domain_id = req.query.id;
   var domain_and_pages = await Domain.findById(domain_id)
      .populate('pages', 'pageURL pageFormatedURL')
      .select('pages domainURL _id');
   return res.status(200).send(domain_and_pages);
});


router.get('/connected_topics',async function(req, res) {
   var topicName = req.query.topic;
   
   var topic = await Topic.findOne({topicName:topicName});

   var token=req.headers['findel-auth-token'];
   var userID= checkAuthAndReturnUserID(token);

   if (userID != '')
        var connected_topics_edges = await Topic_topic_edge.find(
            {$or: [{ topic1: topic }, { topic2: topic } ]})
            .populate('topic1')
            .populate('topic2')
            .populate({
                path: 'usersRanking',
                match: { user: userID}
            });
    else
        var connected_topics_edges = await Topic_topic_edge.find(
            {$or: [{ topic1: topic }, { topic2: topic } ]})
            .populate('topic1')
            .populate('topic2');
   
   connected_topics_data=[];
   connected_topics_edges.forEach(edge => {
      var connected_topic=edge.topic1;
      if (edge.topic1.topicName==topicName)
         connected_topic=edge.topic2;
      
      if (userID != "")
        var user_rankings = edge.usersRanking;
      else
        var user_rankings = [];

      connected_topics_data.push({
         edgeID: edge._id,
         connected_topic_name:connected_topic.topicName,
         liked_positive_points: edge.liked_positive_points,
         liked_negative_points: edge.liked_negative_points,
         web_scrape_score: edge.web_scrape_score,
         last_web_scrape: edge.last_web_scrape,
         user_rankings: user_rankings
      });
   });

   var comments = await extract_comments_from_database(topic.root_comments, userID);

   data={
      topic: topic,
      topics: connected_topics_data,
      comments: comments
   }
   return res.status(200).send(data);
});


router.get('/page_data',async function(req, res) {
   var pageFormatedURL = req.query.pageURL;
   var token=req.headers['findel-auth-token'];
   var userID= checkAuthAndReturnUserID(token);

   if (userID != '')
      var page_topic_edges_populateQuery = [
         {path:'edges_usersRanking', match:{ user: userID}, model: 'page-topic-edges-ranking'}, 
         {path:'topic', model: 'topics'}
         ];
   else
      var page_topic_edges_populateQuery = [ 
         {path:'topic', model: 'topics'}
         ];

   page = await Page.findOne({pageFormatedURL: pageFormatedURL})
      .populate('domain')
      .populate({
         path: 'page_topic_edges',
         populate: page_topic_edges_populateQuery
      });
   
   if (!page)
      return res.status(400).send("Page " + pageURL +" not found in database");
   
   var comments = await extract_comments_from_database(page.root_comments, userID);
   
   return res.status(200).send({
      pageID: page.id,
      pageURL: page.pageURL,
      pageFormatedURL: page.pageFormatedURL,
      pageSnap: page.pageSnap,
      liked_positive_points: page.liked_positive_points,
      like_negative_points: page.liked_negative_points,
      credibility_positive_points: page.credibility_positive_points,
      credibility_negative_points: page.credibility_negative_points,
      educational_positive_points: page.educational_positive_points,
      educational_negative_points: page.educational_negative_points,
      domain: page.domain,
      page_topic_edges: page.page_topic_edges,
      comments: comments
   });

});

module.exports = router;