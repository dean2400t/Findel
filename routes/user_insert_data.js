const jwt = require('jsonwebtoken');
const config = require('config');

var express = require('express');
const {Topic, validateTopic} = require('../models/topics');
const {SiteTopicEdge} = require('../models/siteTopicEdges');
const {Site, validateSite} = require('../models/sites');
const googleSearch=require('../middleware/googleSearch');
const {User} = require('../models/users');
const {Search}=require('../models/searches');
var router = express.Router();

/* GET home page. */
router.post('/insertSiteScores', async function(req, res) {
  var siteID = req.body.siteID
  var num_of_links_in_site= req.body.num_of_links_in_site;
  var jaccard_similarity= req.body.jaccard_similarity;
  
  await Site.findByIdAndUpdate(siteID, {num_of_links_in_site: num_of_links_in_site, 
    jaccard_similarity: jaccard_similarity,
    lastScrape: new Date()});
  return res.status(200).send("site updated successfuly")
});
module.exports = router;