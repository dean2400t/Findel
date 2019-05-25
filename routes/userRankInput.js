var express = require('express');
const auth = require('../middleware/security/auth');
const {Site} = require('../models/sites');
const {UserRanking}=require('../models/userRanking');
const {User} = require('../models/users');
const {Domain} = require('../models/domains');
const {SiteTopicEdge}=require('../models/siteTopicEdges');
const {TopicTopicEdge} = require('../models/topic_to_topic_edges');
var router = express.Router();

function findRankIDinEdge(usersRanking, userID)
{
  for (var index=0; index<usersRanking.length; index++)
    if (usersRanking[index].userID.equals(userID))
      return usersRanking[index];
  return undefined;
}

router.post('/rank_connected_topic', auth, async function(req, res) {
  var edgeID=req.body.edgeID;
  var rankCode=req.body.rankCode;
  if (!edgeID)
    return res.status(400).send("No edgeID was sent");
  if (!rankCode && rankCode!==0)
    return res.status(400).send("No ranking was sent");
  if (rankCode<0 || rankCode>2)
    return res.status(400).send("rankCode must be between 0 to 2");
  
  var edge=await TopicTopicEdge.findById(edgeID);
  if (!edge)
    return res.status(400).send("Edge not found in database");
  
  var user=await User.findById(req.user._id);
  if (!user)
    return res.status(400).send("User not found in database");

  var userRankInEdge= findRankIDinEdge(edge.usersRanking, user._id);

  var edge_weight_to_add=0;
  if (userRankInEdge)
  {
    if (rankCode==0)
    {
      if (userRankInEdge.rankCode==1)
        edge_weight_to_add = -userRankInEdge.scoreAdded;
      else if (userRankInEdge.rankCode==2)
        edge_weight_to_add = userRankInEdge.scoreAdded;
      await TopicTopicEdge.findOneAndUpdate({_id: edge._id},
        { 
          $pull : { usersRanking : {"_id": userRankInEdge._id} },
          $inc: {weight: edge_weight_to_add}
        }, false, false);
    
    }
    else
    {
      if (userRankInEdge.rankCode!=rankCode)
      {
        if (rankCode==1)
            edge_weight_to_add = userRankInEdge.scoreAdded*2;
        if (rankCode==2)
            edge_weight_to_add = -userRankInEdge.scoreAdded*2;
        await SiteTopicEdge.findOneAndUpdate({_id: edge._id, "usersRanking._id": userRankInEdge._id},
        { 
          $set: { "usersRanking.$.rankCode": rankCode},
          $inc: {weight: edge_weight_to_add}
        }, false, false);
      }
    }

  }
  else
    if (rankCode!=0)
    {
      if (user.userScore<0)
        scoreAdded=0;
      else
        scoreAdded=user.userScore
      userRankInEdge=new UserRanking({userID: user._id, rankCode: rankCode, scoreAdded: scoreAdded});
      if (rankCode==1)
          edge_weight_to_add = scoreAdded;
      else if (rankCode==2)
        edge_weight_to_add = -scoreAdded;

      await TopicTopicEdge.findOneAndUpdate({_id: edge._id},
      { 
        $push: { usersRanking: userRankInEdge},
        $inc: {weight: edge_weight_to_add}
      }, false, false);
    }
  

  return res.status(200).send("Updated");
});

router.post('/rankSite', auth, async function(req, res) {
  var edgeID=req.body.edgeID;
  var siteID=req.body.siteID;
  var rankCode=req.body.rankCode;
  if (!edgeID)
    return res.status(400).send("No edgeID was sent");
  if (!siteID)
    return res.status(400).send("No siteID was sent");
  if (!rankCode && rankCode!==0)
    return res.status(400).send("No ranking was sent");
  if (rankCode<0 || rankCode>2)
    return res.status(400).send("rankCode must be between 0 to 2");
  
  var edge=await SiteTopicEdge.findById(edgeID);
  if (!edge)
    return res.status(400).send("Edge not found in database");

  var site=await Site.findById(siteID);
  if (!site)
    return res.status(400).send("Site not found in database");
  
  var user=await User.findById(req.user._id);
  if (!user)
    return res.status(400).send("User not found in database");
  
  var domain=await Domain.findById(site.domain);
  if (!domain)
    return res.status(400).send("Domain not in database");

  var userRankInEdge= findRankIDinEdge(edge.usersRanking, user._id);
  var domain_score_to_add=0;
  var edge_weight_to_add=0;
  if (userRankInEdge)
  {
    if (rankCode==0)
    {
      if (userRankInEdge.rankCode==1)
      {
        edge_weight_to_add = -userRankInEdge.scoreAdded;
        domain_score_to_add = -userRankInEdge.scoreAdded;
        user.favorites.pull(edge._id);
      }
      else if (userRankInEdge.rankCode==2)
      {
        edge_weight_to_add = userRankInEdge.scoreAdded;
        domain_score_to_add = userRankInEdge.scoreAdded;
        user.disliked.pull(edge._id);
      }
      await SiteTopicEdge.findOneAndUpdate({_id: edge._id},
        { 
          $pull : { usersRanking : {"_id": userRankInEdge._id} },
          $inc: {weight: edge_weight_to_add}
        }, false, false);
    
    }
    else
    {
      if (userRankInEdge.rankCode!=rankCode)
      {
        if (rankCode==1)
          {
            edge_weight_to_add = userRankInEdge.scoreAdded*2;
            domain_score_to_add = userRankInEdge.scoreAdded*2;
            user.favorites.pull(edge._id);
            user.disliked.push(edge._id);
          }
        if (rankCode==2)
          {
            edge_weight_to_add = -userRankInEdge.scoreAdded*2;
            domain_score_to_add = -userRankInEdge.scoreAdded*2;
            user.disliked.pull(edge._id);
            user.favorites.push(edge._id);
          }
        await SiteTopicEdge.findOneAndUpdate({_id: edge._id, "usersRanking._id": userRankInEdge._id},
        { 
          $set: { "usersRanking.$.rankCode": rankCode},
          $inc: {weight: edge_weight_to_add}
        }, false, false);
      }
    }

  }
  else
    if (rankCode!=0)
    {
      if (user.userScore<0)
        scoreAdded=0;
      else
        scoreAdded=user.userScore
      userRankInEdge=new UserRanking({userID: user._id, rankCode: rankCode, scoreAdded: scoreAdded});
      if (rankCode==1)
        {
          edge_weight_to_add = scoreAdded;
          domain_score_to_add = scoreAdded;
          user.favorites.push(edge._id);
        }
      else if (rankCode==2)
      {
        edge_weight_to_add = -scoreAdded;
        domain_score_to_add = -scoreAdded;
        user.disliked.push(edge._id);
      }
      await SiteTopicEdge.findOneAndUpdate({_id: edge._id},
      { 
        $push: { usersRanking: userRankInEdge},
        $inc: {weight: edge_weight_to_add}
      }, false, false);
      var x=3;
    }
    
    await user.save();
    if (domain_score_to_add != 0)
      await Domain.findOneAndUpdate({_id: domain._id},
        {$inc:{score: domain_score_to_add}});
  
  return res.status(200).send("Updated");
});
module.exports = router;