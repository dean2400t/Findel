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

   var connected_topics_edges=await TopicTopicEdge.find({$or: [{ topic1: topic }, { topic2: topic } ]}).populate('topic1').populate('topic2');
   connected_topics_data=[];
   connected_topics_edges.forEach(edge => {
      var connected_topic=edge.topic1;
      if (edge.topic1.topicName==topicName)
         connected_topic=edge.topic2;
      var userRankCode=0;
      if (userID!="")
      {
         for (var rankIndex=0; rankIndex<edge.usersRanking.length && userRankCode==0; rankIndex++)
            if (edge.usersRanking[rankIndex].userID.equals(userID))
               userRankCode=edge.usersRanking[rankIndex].rankCode;
      }
      connected_topics_data.push({
         edgeID: edge._id,
         connected_topic_name:connected_topic.topicName,
         edge_weight: edge.weight,
         web_scrape_score: edge.web_scrape_score,
         last_web_scrape: edge.last_web_scrape,
         userRankCode: userRankCode
      });
   });

   return res.status(200).send(connected_topics_data);
});
module.exports = router;