var express = require('express');
const auth = require('../middleware/security/auth');
const {Page} = require('../models/pages');
const {User} = require('../models/users');
const {Domain} = require('../models/domains');
const {Page_topic_edge}=require('../models/page_topic_edges');
const {Topic_topic_edge} = require('../models/topic_to_topic_edges');
const {Page_topic_edges_ranking} = require('../models/page_topic_edges_ranking');
const {Topic_topic_edges_ranking} = require('../models/topic_topic_edges_ranking');
const {Comments_ranking} = require('../models/comments_rankings');
const {Comment} = require('../models/comments');
const {edge_ranking_save, comment_ranking_save} = require('../middleware/save_securely_to_database');
var router = express.Router();

function is_page_topic_edge_rank_type_valid(rank_type){
  if (rank_type == "liked" ||
      rank_type == "credibility" ||
      rank_type == "educational")
      return true;
  return false;
}

function is_topic_topic_edge_rank_type_valid(rank_type){
  if (rank_type == "liked")
      return true;
  return false;
}

function is_comment_rank_type_valid(rank_type){
  if (rank_type == "liked")
      return true;
  return false;
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

//Topic to topic ranking
async function update_scores_to_topic_topic_ranking_edge_insertion(edge_ranking, edge, user, rank_type)
{
  var score_field_name = rank_type + "_weight";
  var field_and_score_in_json = {};
  field_and_score_in_json[score_field_name] = edge_ranking.scoreAdded;
  await Topic_topic_edge.findOneAndUpdate({_id: edge._id},
    {$inc: field_and_score_in_json, $push: {usersRanking: edge_ranking._id}});
  edge[score_field_name] += edge_ranking.scoreAdded;
  await User.findOneAndUpdate({_id: user._id},
    {$push: {topic_topic_edges_ranking: edge_ranking._id}});
  return true;
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
      await Topic_topic_edge.findOneAndUpdate({_id: edge._id},
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
    
  var edge=await Topic_topic_edge.findById(edgeID).populate('topic1').populate('topic2');
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

//page to topic ranking
async function update_scores_to_page_topic_ranking_edge_insertion(edge_ranking, edge, domain, user, rank_type)
{
  var score_field_name = rank_type + "_weight";
  var field_and_score_in_json = {};
  field_and_score_in_json[score_field_name] = edge_ranking.scoreAdded;
  await Domain.findOneAndUpdate({_id: domain._id},
    {$inc: field_and_score_in_json, $push: {usersRanking: edge_ranking._id}});
  domain[score_field_name] += edge_ranking.scoreAdded;
  await Page_topic_edge.findOneAndUpdate({_id: edge._id},
    {$inc: field_and_score_in_json, $push: {usersRanking: edge_ranking._id}});
  edge[score_field_name] += edge_ranking.scoreAdded;
  await User.findOneAndUpdate({_id: user._id},
    {$push: {page_topic_edges_ranking: edge_ranking._id}});
  return true;
}

async function remove_page_topic_ranking_edge_and_update_scores_in_db(edge_ranking, edge, domain, user, rank_type)
{
  var delete_result = await Page_topic_edges_ranking.deleteOne(
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
      await Page_topic_edge.findOneAndUpdate({_id: edge._id},
        {$inc: field_and_score_in_json, $pull: {usersRanking: edge_ranking._id}});
      edge[score_field_name] -= edge_ranking.scoreAdded;
      await User.findOneAndUpdate({_id: user._id},
        {$pull: {page_topic_edges_ranking: edge_ranking._id}});
      return true;
    }
  return false
}

function data_to_return_for_page_topic_edge_ranking(rank_type, rankCode, edge_ranking, edge, domain)
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

router.post('/rank_page_topic_edge', auth, async function(req, res) {
  
  var edgeID=req.body.edgeID;
  var rank_type = req.body.rank_type;
  var rankCode=req.body.rankCode;
  if (!edgeID)
    return res.status(400).send("No edgeID was sent");
  if (!rank_type)
    return res.status(400).send("No rank_type was sent");
  if (!is_page_topic_edge_rank_type_valid(rank_type))
    return res.status(400).send("rank_type is not valid");
  if (!rankCode && rankCode!==0)
    return res.status(400).send("No rank_code was sent");
  if (rankCode<0 || rankCode>2)
    return res.status(400).send("rankCode must be 0, 1, or 2");
  if (!Number.isInteger(rankCode))
  return res.status(400).send("rankCode must be 0, 1, or 2");
    
  var edge=await Page_topic_edge.findById(edgeID).populate('page');
  if (!edge)
    return res.status(400).send("Edge not found in database");

  var page = edge.page;
  if (!page)
    return res.status(400).send("Page not found in database");

  var user=await User.findById(req.user._id);
  if (!user)
    return res.status(400).send("User not found in database");
  
  var domain=await Domain.findById(page.domain);
  if (!domain)
    return res.status(400).send("Domain not in database");

  
  
  var edge_ranking = await Page_topic_edges_ranking.findOne(
    {edge: edge._id, user: user._id, rank_type: rank_type});
  if (!edge_ranking)
  {
    if (rankCode == 0)
      return res.status(400).send("Edge is already not ranked");
    else
    {
      edge_ranking = await insert_ranking_edge_to_database(
        Page_topic_edges_ranking, edge, user, rank_type, rankCode);
      if (!edge_ranking)
        return res.status(400).send("Double request");
      
      if (await update_scores_to_page_topic_ranking_edge_insertion(
        edge_ranking, edge, domain, user, rank_type) == true)
          return res.status(200).send(data_to_return_for_page_topic_edge_ranking(rank_type, rankCode, edge_ranking, edge, domain));
    }
  }

  if (edge_ranking.rankCode == rankCode)
    if (rankCode == 1 || rankCode == 2)
      return res.status(200).send(data_to_return_for_page_topic_edge_ranking(rank_type, rankCode, edge_ranking, edge, domain));

  if (await remove_page_topic_ranking_edge_and_update_scores_in_db(
    edge_ranking, edge, domain, user, rank_type) == true)
  {
    if (rankCode == 0)
      return res.status(200).send(data_to_return_for_page_topic_edge_ranking(rank_type, rankCode, edge_ranking, edge, domain));
    
    edge_ranking = await insert_ranking_edge_to_database(
      Page_topic_edges_ranking, edge, user, rank_type, rankCode);
    if (!edge_ranking)
      return res.status(400).send("Double request");
    
    
    if (await update_scores_to_page_topic_ranking_edge_insertion(
      edge_ranking, edge, domain, user, rank_type)==true)
        return res.status(200).send(data_to_return_for_page_topic_edge_ranking(rank_type, rankCode, edge_ranking, edge, domain));
  }
  return res.status(400).send("Failed to enter ranking");
});

//comment ranking
async function insert_comment_ranking_to_database(comment, user, rank_type, rankCode)
{
  var user_score = user.userScore;
  if (user_score<0)
    user_score = 0;
  if (rankCode == 2)
    user_score *= -1;
  var comment_ranking = new Comments_ranking({
    comment: comment._id,
    user: user._id,
    rank_type: rank_type,
    rankCode: rankCode,
    scoreAdded: user_score
    });
  if (await comment_ranking_save(comment_ranking)==true)
    return comment_ranking;
  else
    return null;
}

async function update_scores_to_comment_ranking_insertion(comment_ranking, comment, user, rank_type)
{
  var score_field_name = rank_type + "_weight";
  var field_and_score_in_json = {};
  field_and_score_in_json[score_field_name] = comment_ranking.scoreAdded;
  await Comment.findOneAndUpdate({_id: comment._id},
    {$inc: field_and_score_in_json, $push: {usersRanking: comment_ranking._id}});
  comment[score_field_name] += comment_ranking.scoreAdded;

  await User.findOneAndUpdate({_id: user._id},
    {$push: {comments_ranking: comment_ranking._id}});
  return true;
}

function data_to_return_for_comment_ranking(rank_type, rankCode, comment_ranking, comment)
{
  var weight = comment[rank_type + "_weight"];

  if (rankCode != 0)
    weight -= comment_ranking.scoreAdded;
    
  if (rankCode == 1)
    weight += 1;

  else if (rankCode == 2)
    weight -= 1;

  return {
    rankCode: rankCode,
    commentID: comment._id,
    weight: weight,
    comment_ranking_date: comment_ranking._id.getTimestamp(),
    comment_ranking_id: comment_ranking.id
    } 
}

async function remove_comment_ranking_and_update_scores_in_db(comment_ranking, comment, user, rank_type)
{
  var delete_result = await Comments_ranking.deleteOne(
    {comment: comment._id, user: user._id, rank_type: rank_type});
  
  if (delete_result != null)
    if (delete_result.n == 1)
    {
      var score_field_name = rank_type + "_weight";
      var field_and_score_in_json = {};
      field_and_score_in_json[score_field_name] = -comment_ranking.scoreAdded;
      await Comment.findOneAndUpdate({_id: comment._id},
        {$inc: field_and_score_in_json, $pull: {usersRanking: comment_ranking._id}});
      comment[score_field_name] -= comment_ranking.scoreAdded;
      await User.findOneAndUpdate({_id: user._id},
        {$pull: {comments_ranking: comment_ranking._id}});
      return true;
    }
  return false
}

router.post('/rank_comment', auth, async function(req, res) {
  
  var commentID=req.body.commentID;
  var rank_type = req.body.rank_type;
  var rankCode=req.body.rankCode;
  if (!commentID)
    return res.status(400).send("No commentID was sent");
  if (!rank_type)
    return res.status(400).send("No rank_type was sent");
  if (!is_comment_rank_type_valid(rank_type))
    return res.status(400).send("rank_type is not valid");
  if (!rankCode && rankCode!==0)
    return res.status(400).send("No rank_code was sent");
  if (rankCode<0 || rankCode>2)
    return res.status(400).send("rankCode must be 0, 1, or 2");
  if (!Number.isInteger(rankCode))
  return res.status(400).send("rankCode must be 0, 1, or 2");
    
  var comment=await Comment.findById(commentID);
  if (!comment)
    return res.status(400).send("Comment not found in database");

  var user=await User.findById(req.user._id);
  if (!user)
    return res.status(400).send("User not found in database");
  
  var comment_ranking = await Comments_ranking.findOne(
    {comment: comment._id, user: user._id, rank_type: rank_type});
  if (!comment_ranking)
  {
    if (rankCode == 0)
      return res.status(400).send("Comment is already not ranked");
    else
    {
      comment_ranking = await insert_comment_ranking_to_database(
        comment, user, rank_type, rankCode);
      if (!comment_ranking)
        return res.status(400).send("Double request");
      
      if (await update_scores_to_comment_ranking_insertion(
        comment_ranking, comment, user, rank_type) == true)
          return res.status(200).send(data_to_return_for_comment_ranking(rank_type, rankCode, comment_ranking, comment));
    }
  }

  if (comment_ranking.rankCode == rankCode)
    if (rankCode == 1 || rankCode == 2)
      return res.status(200).send(data_to_return_for_comment_ranking(rank_type, rankCode, comment_ranking, comment));

  if (await remove_comment_ranking_and_update_scores_in_db(
    comment_ranking, comment, user, rank_type) == true)
  {
    if (rankCode == 0)
      return res.status(200).send(data_to_return_for_comment_ranking(rank_type, rankCode, comment_ranking, comment));
    
    comment_ranking = await insert_comment_ranking_to_database(
      comment, user, rank_type, rankCode);
    if (!comment_ranking)
      return res.status(400).send("Double request");
    
    
    if (await update_scores_to_comment_ranking_insertion(
      comment_ranking, comment, user, rank_type)==true)
        return res.status(200).send(data_to_return_for_comment_ranking(rank_type, rankCode, comment_ranking, comment));
  }
  return res.status(400).send("Failed to enter ranking");
});
module.exports = router;