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

function findRankIDinEdge(usersRanking, userID)
{
  for (var index=0; index<usersRanking.length; index++)
    if (usersRanking[index].userID.equals(userID))
      return usersRanking[index];
  return undefined;
}

router.post('/rankSite', auth, async function(req, res) {
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
    return res.status(400).send("Topic not found in database");
  if (!siteFromDB)
    return res.status(400).send("Site not found in database");
  
  var user=await User.findById(req.user._id);
  var siteTopicEdge=await SiteTopicEdge.findOne({topic: topicFromDB._id, site: siteFromDB._id});

  if (!user)
    return res.status(400).send("User not found in database");
  if (!siteTopicEdge)
    return res.status(400).send("Site to Topic edge not found in database");
  
  var userRankInEdge= findRankIDinEdge(siteTopicEdge.usersRanking, user._id);

  if (userRankInEdge)
  {
    if (rankCode==0)
    {
      var newWeight=siteTopicEdge.weight;
      if (userRankInEdge.rankCode==1)
        newWeight-=userRankInEdge.scoreAdded;
      else if (userRankInEdge.rankCode==2)
        newWeight+=userRankInEdge.scoreAdded;
      userRankInEdge.remove();
      siteTopicEdge.weight=newWeight;

      await siteTopicEdge.save();
    }
    if (rankCode==1)
      if (userRankInEdge.rankCode==2)
      {
        userRankInEdge.$set({'rankCode': rankCode});
        siteTopicEdge.weight+=userRankInEdge.scoreAdded*2;
        await siteTopicEdge.save();
      }
    if (rankCode==2)
      if (userRankInEdge.rankCode==1)
      {
        userRankInEdge.$set({'rankCode': rankCode});
        siteTopicEdge.weight-=userRankInEdge.scoreAdded*2;
        await siteTopicEdge.save();
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
      siteTopicEdge.usersRanking.push(userRankInEdge);
      if (rankCode==1)
        siteTopicEdge.weight+=user.userScore;
      else if (rankCode==2)
        siteTopicEdge.weight-=user.userScore;
      await siteTopicEdge.save();
    }
  

  return res.status(200).send("Updated");
});
module.exports = router;