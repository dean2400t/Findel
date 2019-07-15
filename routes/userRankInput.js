var express = require('express');
const auth = require('../middleware/security/auth');
const {Site} = require('../models/sites');
const {UserRanking}=require('../models/userRanking');
const {User} = require('../models/users');
const {Domain} = require('../models/domains');
const {SiteTopicEdge}=require('../models/siteTopicEdges');
const {TopicTopicEdge} = require('../models/topic_to_topic_edges');
const {Site_topic_edges_ranking} = require('../models/site_topic_edges_ranking');
const {edge_ranking_save} = require('../middleware/save_securely_to_database');
var router = express.Router();

function is_rank_type_valid(rank_type){
  if (rank_type == "liked" ||
      rank_type == "trustworthy" ||
      rank_type == "educational")
      return true;
  return false;
}

async function insert_ranking_edge_to_database(edges_ranking_collection, user, rank_type, rankCode)
{
  var user_score = user.userScore;
  if (user_score<0)
    user_score=0;
  if (rankCode == 2)
    user_score *= -1;
  var edge_ranking = new edges_ranking_collection({
    edge: edge._id,
    user: user._id,
    rank_type: rank_type,
    rankCode: rankCode,
    scoreAdded: user_score
    });
  if (await edge_ranking_save(edge_ranking))
    return edge_ranking;
  else
    return null;
}

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

async function update_scores_to_site_topic_ranking_edge_insertion(edge_ranking, edge, domain, user, rank_type)
{
  var score_field_name = rank_type + "_weight";
  var field_and_score_in_json = {};
  field_and_score_in_json[score_field_name] = edge_ranking.scoreAdded;
  await Domain.findOneAndUpdate({_id: domain._id},
    {$inc: field_and_score_in_json, $push: {usersRanking: edge_ranking._id}});
  await SiteTopicEdge.findOneAndUpdate({_id: edge._id},
    {$inc: field_and_score_in_json, $push: {usersRanking: edge_ranking._id}});
  await User.findOneAndUpdate({_id: user._id},
    {$push: {site_topic_edges_ranking: edge_ranking._id}});
  return res.status(200).send({
    rankCode: rankCode,
    edgeID: edge._id
  });
}

async function remove_ranking_edge_and_update_scores_in_db(edge_ranking, edge, domain, user, rank_type)
{
  var delete_result = await Site_topic_edges_ranking.deleteOne(
    {edge: edge_ranking._id, user: user._id, rank_type: rank_type})
  
  if (delete_result != null)
    if (delete_result.n == 1)
    {
      var score_field_name = rank_type + "_weight";
      var field_and_score_in_json = {};
      field_and_score_in_json[score_field_name] = -edge_ranking.scoreAdded;
      await Domain.findOneAndUpdate({_id: domain._id},
        {$inc: field_and_score_in_json, $pull: {usersRanking: edge_ranking._id}});
      await SiteTopicEdge.findOneAndUpdate({_id: edge._id},
        {$inc: field_and_score_in_json, $pull: {usersRanking: edge_ranking._id}});
      await User.findOneAndUpdate({_id: user._id},
        {$pull: {site_topic_edges_ranking: edge_ranking._id}});
      return true;
    }
  return false
}

router.post('/rankSite', auth, async function(req, res) {
  
  var edgeID=req.body.edgeID;
  var rank_type = req.body.rank_type;
  var rankCode=req.body.rankCode;
  if (!edgeID)
    return res.status(400).send("No edgeID was sent");
  if (!rank_type)
    return res.status(400).send("No rank_type was sent");
  if (!is_rank_type_valid(rank_type))
    return res.status(400).send("rank_type is not valid");
  if (!rankCode && rankCode!==0)
    return res.status(400).send("No rank_code was sent");
  if (rankCode<0 || rankCode>2)
    return res.status(400).send("rankCode must be 0, 1, or 2");
  if (!Number.isInteger(rankCode))
  return res.status(400).send("rankCode must be 0, 1, or 2");
    
  var edge=await SiteTopicEdge.findById(edgeID).populate('site');
  if (!edge)
    return res.status(400).send("Edge not found in database");

  var site = edge.site;
  if (!site)
    return res.status(400).send("Site not found in database");

  var user=await User.findById(req.user._id);
  if (!user)
    return res.status(400).send("User not found in database");
  
  var domain=await Domain.findById(site.domain);
  if (!domain)
    return res.status(400).send("Domain not in database");

  
  
  var edge_ranking = await Site_topic_edges_ranking.findOne(
    {edge: edge._id, user: user._id, rank_type: rank_type});
  if (!edge_ranking)
  {
    if (rankCode == 0)
      return res.status(200).send({
        rankCode: 0,
        edgeID: edge._id
      });
    else
    {
      edge_ranking = await insert_ranking_edge_to_database(
        Site_topic_edges_ranking, user, rank_type, rankCode);
      if (!edge_ranking)
        return res.status(400).send("Double request");
      
      await update_scores_to_site_topic_ranking_edge_insertion(
        edge_ranking, edge, domain, user, rank_type);
      return res.status(200).send({
        rankCode: rankCode,
        edgeID: edge._id
      });
    }
  }

  if (edge_ranking.rankCode == rankCode)
    return res.status(200).send({
      rankCode: rankCode,
      edgeID: edge._id
    });

  if (await remove_ranking_edge_and_update_scores_in_db(
    edge_ranking, edge, domain, user, rank_type) == true)
  {
    edge_ranking = await insert_ranking_edge_to_database(
      Site_topic_edges_ranking, user, rank_type, rankCode);
    if (!edge_ranking)
      return res.status(400).send("Double request");
    
    await update_scores_to_site_topic_ranking_edge_insertion(
      edge_ranking, edge, domain, user, rank_type);
    return res.status(200).send({
      rankCode: rankCode,
      edgeID: edge._id
    });
  }
  
  return res.status(200).send("Updated");
});
module.exports = router;