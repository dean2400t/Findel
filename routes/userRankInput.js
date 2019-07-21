var express = require('express');
const auth = require('../middleware/security/auth');
const {Site} = require('../models/sites');
const {UserRanking}=require('../models/userRanking');
const {User} = require('../models/users');
const {Domain} = require('../models/domains');
const {SiteTopicEdge}=require('../models/siteTopicEdges');
const {TopicTopicEdge} = require('../models/topic_to_topic_edges');
const {Site_topic_edges_ranking} = require('../models/site_topic_edges_ranking');
const {Topic_topic_edges_ranking} = require('../models/topic_topic_edges_ranking');
const {edge_ranking_save} = require('../middleware/save_securely_to_database');
var router = express.Router();

function is_site_topic_edge_rank_type_valid(rank_type){
  if (rank_type == "liked" ||
      rank_type == "trustworthy" ||
      rank_type == "educational")
      return true;
  return false;
}

function is_topic_topic_edge_rank_type_valid(rank_type){
  if (rank_type == "liked")
      return true;
  return false;
}

async function update_scores_to_topic_topic_ranking_edge_insertion(edge_ranking, edge, user, rank_type)
{
  var score_field_name = rank_type + "_weight";
  var field_and_score_in_json = {};
  field_and_score_in_json[score_field_name] = edge_ranking.scoreAdded;
  await TopicTopicEdge.findOneAndUpdate({_id: edge._id},
    {$inc: field_and_score_in_json, $push: {usersRanking: edge_ranking._id}});
  edge[score_field_name] += edge_ranking.scoreAdded;
  await User.findOneAndUpdate({_id: user._id},
    {$push: {topic_topic_edges_ranking: edge_ranking._id}});
  return true;
}

async function insert_ranking_edge_to_database(edges_ranking_collection, edge, user, rank_type, rankCode)
{
  var user_score = user.userScore;
  if (user_score<0)
    user_score = 0;
  if (rankCode == 2)
    user_score *= -1;
  var edge_ranking = new edges_ranking_collection({
    edge: edge._id,
    user: user._id,
    rank_type: rank_type,
    rankCode: rankCode,
    scoreAdded: user_score
    });
  if (await edge_ranking_save(edge_ranking)==true)
    return edge_ranking;
  else
    return null;
}

async function remove_topic_topic_ranking_edge_and_update_scores_in_db(edge_ranking, edge, user, rank_type)
{
  var delete_result = await Topic_topic_edges_ranking.deleteOne(
    {edge: edge._id, user: user._id, rank_type: rank_type});
  
  if (delete_result != null)
    if (delete_result.n == 1)
    {
      var score_field_name = rank_type + "_weight";
      var field_and_score_in_json = {};
      field_and_score_in_json[score_field_name] = -edge_ranking.scoreAdded;
      await TopicTopicEdge.findOneAndUpdate({_id: edge._id},
        {$inc: field_and_score_in_json, $pull: {usersRanking: edge_ranking._id}});
      edge[score_field_name] -= edge_ranking.scoreAdded;
      await User.findOneAndUpdate({_id: user._id},
        {$pull: {topic_topic_edges_ranking: edge_ranking._id}});
      return true;
    }
  return false
}

function data_to_return_for_topic_topic_edge_ranking(rank_type, rankCode, edge_ranking, edge)
{
  var weight = edge[rank_type + "_weight"];

  if (rankCode != 0)
    weight -= edge_ranking.scoreAdded;
  if (rankCode == 1)
    weight += 1;
  else if (rankCode == 2)
    weight -= 1;

  return {
    rankCode: rankCode,
    edgeID: edge._id,
    weight: weight,
    edge_ranking_date: edge_ranking._id.getTimestamp(),
    edge_ranking_id: edge_ranking.id
    } 
}

router.post('/rank_topic_topic_edge', auth, async function(req, res) {
  var edgeID=req.body.edgeID;
  var rank_type = req.body.rank_type;
  var rankCode=req.body.rankCode;
  if (!edgeID)
    return res.status(400).send("No edgeID was sent");
  if (!rank_type)
    return res.status(400).send("No rank_type was sent");
  if (!is_topic_topic_edge_rank_type_valid(rank_type))
    return res.status(400).send("rank_type is not valid");
  if (!rankCode && rankCode!==0)
    return res.status(400).send("No rank_code was sent");
  if (rankCode<0 || rankCode>2)
    return res.status(400).send("rankCode must be 0, 1, or 2");
  if (!Number.isInteger(rankCode))
  return res.status(400).send("rankCode must be 0, 1, or 2");
    
  var edge=await TopicTopicEdge.findById(edgeID).populate('topic1').populate('topic2');
  if (!edge)
    return res.status(400).send("Edge not found in database");

  var topic1 = edge.topic1;
  if (!topic1)
    return res.status(400).send("Topic1 not found in database");

  var topic2 = edge.topic2;
  if (!topic2)
    return res.status(400).send("Topic2 not found in database");

  var user=await User.findById(req.user._id);
  if (!user)
    return res.status(400).send("User not found in database");
  
    var edge_ranking = await Topic_topic_edges_ranking.findOne(
      {edge: edge._id, user: user._id, rank_type: rank_type});
    if (!edge_ranking)
    {
      if (rankCode == 0)
        return res.status(400).send("Edge is already not ranked");
      else
      {
        edge_ranking = await insert_ranking_edge_to_database(
          Topic_topic_edges_ranking, edge, user, rank_type, rankCode);
        if (!edge_ranking)
          return res.status(400).send("Double request");
        
        if (await update_scores_to_topic_topic_ranking_edge_insertion(
          edge_ranking, edge, user, rank_type) == true)
            return res.status(200).send(data_to_return_for_topic_topic_edge_ranking(
              rank_type, rankCode, edge_ranking, edge));
      }
    }
  
    if (edge_ranking.rankCode == rankCode)
      if (rankCode == 1 || rankCode == 2)
        return res.status(200).send(data_to_return_for_topic_topic_edge_ranking(
          rank_type, rankCode, edge_ranking, edge));
  
    if (await remove_topic_topic_ranking_edge_and_update_scores_in_db(
      edge_ranking, edge, user, rank_type) == true)
    {
      if (rankCode == 0)
        return res.status(200).send(data_to_return_for_topic_topic_edge_ranking(
          rank_type, rankCode, edge_ranking, edge));
      
      edge_ranking = await insert_ranking_edge_to_database(
        Topic_topic_edges_ranking, edge, user, rank_type, rankCode);
      if (!edge_ranking)
        return res.status(400).send("Double request");
      
      
      if (await update_scores_to_topic_topic_ranking_edge_insertion(
        edge_ranking, edge, user, rank_type)==true)
          return res.status(200).send(data_to_return_for_topic_topic_edge_ranking(
            rank_type, rankCode, edge_ranking, edge));
    }
    return res.status(400).send("Failed to enter ranking");
  });

async function update_scores_to_site_topic_ranking_edge_insertion(edge_ranking, edge, domain, user, rank_type)
{
  var score_field_name = rank_type + "_weight";
  var field_and_score_in_json = {};
  field_and_score_in_json[score_field_name] = edge_ranking.scoreAdded;
  await Domain.findOneAndUpdate({_id: domain._id},
    {$inc: field_and_score_in_json, $push: {usersRanking: edge_ranking._id}});
  domain[score_field_name] += edge_ranking.scoreAdded;
  await SiteTopicEdge.findOneAndUpdate({_id: edge._id},
    {$inc: field_and_score_in_json, $push: {usersRanking: edge_ranking._id}});
  edge[score_field_name] += edge_ranking.scoreAdded;
  await User.findOneAndUpdate({_id: user._id},
    {$push: {site_topic_edges_ranking: edge_ranking._id}});
  return true;
}

async function remove_site_topic_ranking_edge_and_update_scores_in_db(edge_ranking, edge, domain, user, rank_type)
{
  var delete_result = await Site_topic_edges_ranking.deleteOne(
    {edge: edge._id, user: user._id, rank_type: rank_type});
  
  if (delete_result != null)
    if (delete_result.n == 1)
    {
      var score_field_name = rank_type + "_weight";
      var field_and_score_in_json = {};
      field_and_score_in_json[score_field_name] = -edge_ranking.scoreAdded;
      await Domain.findOneAndUpdate({_id: domain._id},
        {$inc: field_and_score_in_json, $pull: {usersRanking: edge_ranking._id}});
      domain[score_field_name] -= edge_ranking.scoreAdded;
      await SiteTopicEdge.findOneAndUpdate({_id: edge._id},
        {$inc: field_and_score_in_json, $pull: {usersRanking: edge_ranking._id}});
      edge[score_field_name] -= edge_ranking.scoreAdded;
      await User.findOneAndUpdate({_id: user._id},
        {$pull: {site_topic_edges_ranking: edge_ranking._id}});
      return true;
    }
  return false
}

function data_to_return_for_site_topic_edge_ranking(rank_type, rankCode, edge_ranking, edge, domain)
{
  var weight = edge[rank_type + "_weight"];
  var domain_weight = domain[rank_type + "_weight"];

  if (rankCode != 0)
  {
    weight -= edge_ranking.scoreAdded;
    domain_weight -= edge_ranking.scoreAdded;
  }
    
  if (rankCode == 1)
  {
    weight += 1;
    domain_weight += 1;
  }
  else if (rankCode == 2)
  {
    weight -= 1;
    domain_weight -= 1;
  }
  return {
    rankCode: rankCode,
    edgeID: edge._id,
    weight: weight,
    domain_weight: domain_weight,
    edge_ranking_date: edge_ranking._id.getTimestamp(),
    edge_ranking_id: edge_ranking.id
    } 
}

router.post('/rank_site_topic_edge', auth, async function(req, res) {
  
  var edgeID=req.body.edgeID;
  var rank_type = req.body.rank_type;
  var rankCode=req.body.rankCode;
  if (!edgeID)
    return res.status(400).send("No edgeID was sent");
  if (!rank_type)
    return res.status(400).send("No rank_type was sent");
  if (!is_site_topic_edge_rank_type_valid(rank_type))
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
      return res.status(400).send("Edge is already not ranked");
    else
    {
      edge_ranking = await insert_ranking_edge_to_database(
        Site_topic_edges_ranking, edge, user, rank_type, rankCode);
      if (!edge_ranking)
        return res.status(400).send("Double request");
      
      if (await update_scores_to_site_topic_ranking_edge_insertion(
        edge_ranking, edge, domain, user, rank_type) == true)
          return res.status(200).send(data_to_return_for_site_topic_edge_ranking(rank_type, rankCode, edge_ranking, edge, domain));
    }
  }

  if (edge_ranking.rankCode == rankCode)
    if (rankCode == 1 || rankCode == 2)
      return res.status(200).send(data_to_return_for_site_topic_edge_ranking(rank_type, rankCode, edge_ranking, edge, domain));

  if (await remove_site_topic_ranking_edge_and_update_scores_in_db(
    edge_ranking, edge, domain, user, rank_type) == true)
  {
    if (rankCode == 0)
      return res.status(200).send(data_to_return_for_site_topic_edge_ranking(rank_type, rankCode, edge_ranking, edge, domain));
    
    edge_ranking = await insert_ranking_edge_to_database(
      Site_topic_edges_ranking, edge, user, rank_type, rankCode);
    if (!edge_ranking)
      return res.status(400).send("Double request");
    
    
    if (await update_scores_to_site_topic_ranking_edge_insertion(
      edge_ranking, edge, domain, user, rank_type)==true)
        return res.status(200).send(data_to_return_for_site_topic_edge_ranking(rank_type, rankCode, edge_ranking, edge, domain));
  }
  return res.status(400).send("Failed to enter ranking");
});
module.exports = router;