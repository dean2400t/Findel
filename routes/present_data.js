const jwt = require('jsonwebtoken');
const config = require('config');
var express = require('express');
var router = express.Router();
const {Domain} = require('../models/domains');
const {Topic} = require('../models/topics');
const {TopicTopicEdge} = require('../models/topic_to_topic_edges');

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
   var domains = await Domain.find({}).select('score domainURL _id');
   return res.status(200).send(domains);
});

router.get('/domain_sites', async function(req, res) {
   var domain_id = req.query.id;
   var domain_and_sites = await Domain.findById(domain_id)
      .populate('sites', 'siteURL siteFormatedURL')
      .select('score sites domainURL _id');
   return res.status(200).send(domain_and_sites);
});

router.get('/connected_topics',async function(req, res) {
   var topicName = req.query.topic;
   
   var topic = await Topic.findOne({topicName:topicName});

   var token=req.headers['findel-auth-token'];
   var userID= checkAuthAndReturnUserID(token);

   if (userID != '')
        var connected_topics_edges = await TopicTopicEdge.find(
            {$or: [{ topic1: topic }, { topic2: topic } ]})
            .populate('topic1')
            .populate('topic2')
            .populate({
                path: 'usersRanking',
                match: { user: userID}
            });
    else
        var connected_topics_edges = await TopicTopicEdge.find(
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
         liked_weight: edge.liked_weight,
         web_scrape_score: edge.web_scrape_score,
         last_web_scrape: edge.last_web_scrape,
         user_rankings: user_rankings
      });
   });

   return res.status(200).send(connected_topics_data);
});
module.exports = router;