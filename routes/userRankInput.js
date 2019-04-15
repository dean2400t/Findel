const jwt = require('jsonwebtoken');
const config = require('config');

var express = require('express');
const auth = require('../middleware/security/auth');
const {Topic, validateTopic} = require('../models/topics');
const {SiteTopicEdge} = require('../models/siteTopicEdges');
const {Site, validateSite} = require('../models/sites');
const {UserRanking}=require('../models/userRanking');
const {User} = require('../models/users');
var router = express.Router();

function findRankIDinEdge(usersRanking, userID)
{
  usersRanking.forEach(ranking => {
    if (ranking.userID==userID)
      return ranking;
    else
      var x=3;      
  });
  return null;
}

/* GET home page. */
router.post('/rankSite', auth, async function(req, res) {
  //res.render('index');
  var topic=req.body.topic;
  var siteURL=req.body.siteURL;
  var rankCode=req.body.rankCode;
  if (!topic)
    return res.status(400).send("No topic was sent");
  if (!siteURL)
    return res.status(400).send("No siteURL was sent");
  if (!rankCode && rankCode!==0)
    return res.status(400).send("No ranking was sent");
  if (rankCode<0 || rankCode>2)
    return res.status(400).send("rankCode must be between 0 to 2");
  
  var topicFromDB=await Topic.findOne({topicName: topic});
  var siteFromDB=await Site.findOne({siteURL: siteURL});
  if (!topicFromDB)
    return res.status(400).send("topic not found in database");
  if (!siteFromDB)
    return res.status(400).send("site not found in database");
  
  var user=await User.findById(req.user._id);
  var siteTopicEdge=await SiteTopicEdge.findOne({topic: topicFromDB._id, site: siteFromDB._id});

  if (!user)
    return res.status(400).send("User not found in database");
  if (!siteTopicEdge)
    return res.status(400).send("Site to Topic edge not found in database");
  
  if (siteTopicEdge.usersRanking.length==0)
    var userRankInEdge=undefined;
  else
    var userRankInEdge

  if (userRankInEdge)
  {
    if (rankCode==0)
    {
      await SiteTopicEdge.findByIdAndUpdate(siteTopicEdge._id,{$pull: {usersRanking: userRankInEdge}});
    }
    if (rankCode==1)
      if (userRankInEdge.rankCode==2)
      {
        await SiteTopicEdge.findOneAndUpdate({_id: siteTopicEdge._id, "usersRanking._id": userRankInEdge._id},{ $set:  { 'usersRanking.$.rankCode': rankCode }});
      }
    if (rankCode==2)
      if (userRankInEdge.rankCode==1)
      {
        await SiteTopicEdge.findOneAndUpdate({_id: siteTopicEdge._id, "usersRanking._id": userRankInEdge._id},{ $set:  { 'usersRanking.$.rankCode': rankCode }});
      }
  }
  else
    if (rankCode!=0)
    {
      var scoreAdded=0;
      if (user.userScore>0)
        scoreAdded=user.userScore;
      else
        user.userScore=0;
      userRankInEdge=new UserRanking({userID: user._id, rankCode: rankCode, scoreAdded: user.userScore});
      await SiteTopicEdge.findByIdAndUpdate(siteTopicEdge._id,{$push: {usersRanking: userRankInEdge}});
    }
  

  return res.status(200).send("Updated");
});
module.exports = router;