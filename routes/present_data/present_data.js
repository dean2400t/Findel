
var express = require('express');
var router = express.Router();
const {Domain} = require('../../models/domains');

const checkAuthAndReturnUserID = require('../../middleware/checkAuthAndReturnUserID');
const retrieve_page_data = require('./retrieve_page_data');
const retrieve_connected_topics = require('../topics_to_topics/retrieve_topic_and_connected_topics');

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
   var token=req.headers['findel-auth-token'];
   var userID= checkAuthAndReturnUserID(token);

   return retrieve_connected_topics(topicName, userID, res);
});


router.get('/page_data',async function(req, res) {
   var pageFormatedURL = req.query.pageURL;
   if (!pageFormatedURL)
      return res.status(400).send("No pageFormatedURL was sent")
   var token=req.headers['findel-auth-token'];
   var userID= checkAuthAndReturnUserID(token);
   return retrieve_page_data(pageFormatedURL, userID, res);
});

module.exports = router;