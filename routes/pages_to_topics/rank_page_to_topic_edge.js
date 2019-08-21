const get_score_field_name= require('../../middleware/get_score_field_name');
const {ranking_save} = require('../middleware/save_securely_to_database');

const {page_topic_edges_selection}= require('../../models/common_fields_selection/page_topic_edges_selections');
const {page_populate}= require('../../models/common_fields_selection/page_selections');
const {domain_populate}= require('../../models/common_fields_selection/domain_selections');
const {User} = require('../models/users');
const {Page_topic_edge}=require('../models/page_topic_edges');
const {Page_topic_edges_ranking} = require('../models/page_topic_edges_ranking');

function is_page_topic_edge_rank_type_valid(rank_type){
    if (rank_type == "liked")
        return true;
    return false;
  }

async function insert_ranking_edge_to_database(edges_ranking_collection, edge, user, rank_type, rankCode)
{
var user_score = user.userScore;
if (user_score<0)
    user_score = 0;
var edge_ranking = new edges_ranking_collection({
    edge: edge._id,
    user: user._id,
    rank_type: rank_type,
    rankCode: rankCode,
    scoreAdded: user_score
    });
if (await ranking_save(edge_ranking)==true)
    return edge_ranking;
else
    return null;
}

async function update_scores_to_page_topic_ranking_edge_insertion(edge_ranking, edge, domain, user, rank_type)
{
  var score_field_name = get_score_field_name(rank_type, edge_ranking.rankCode);
  var field_and_score_in_json = {};
  field_and_score_in_json[score_field_name] = edge_ranking.scoreAdded;

  await Domain.findOneAndUpdate({_id: domain._id},
    {$inc: field_and_score_in_json, $push: {edges_to_pages_usersRanking: edge_ranking._id}});
  domain[score_field_name] += edge_ranking.scoreAdded;

  await Page.findOneAndUpdate({_id: edge.page._id},
    {$inc: field_and_score_in_json, $push: {edges_usersRanking: edge_ranking._id}});
  
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
      var score_field_name = get_score_field_name(rank_type, edge_ranking.rankCode);
      var field_and_score_in_json = {};
      field_and_score_in_json[score_field_name] = -edge_ranking.scoreAdded;
      await Domain.findOneAndUpdate({_id: domain._id},
        {$inc: field_and_score_in_json, $pull: {edges_to_pages_usersRanking: edge_ranking._id}});
      domain[score_field_name] -= edge_ranking.scoreAdded;

      await Page.findOneAndUpdate({_id: edge.page._id},
        {$inc: field_and_score_in_json, $pull: {edges_usersRanking: edge_ranking._id}});
      edge.page[score_field_name] -= edge_ranking.scoreAdded;

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
  var positive_score_field_name = get_score_field_name(rank_type, 1);
  var negative_score_field_name = get_score_field_name(rank_type, 2);

  var positive_points = edge[positive_score_field_name];
  var negative_points = edge[negative_score_field_name];
  var domain_positive_points = domain[positive_score_field_name];
  var domain_negative_points = domain[negative_score_field_name];
  var page_positive_points = edge.page[positive_score_field_name];
  var page_negative_points = edge.page[negative_score_field_name];


  if (rankCode == 1)
  {
    positive_points -= edge_ranking.scoreAdded
    positive_points += 1;
    domain_positive_points -= edge_ranking.scoreAdded
    domain_positive_points += 1;
    page_positive_points -= edge_ranking.scoreAdded
    page_positive_points += 1;
  }
  else if (rankCode == 2)
  {
    negative_points -= edge_ranking.scoreAdded
    negative_points += 1;
    domain_negative_points -= edge_ranking.scoreAdded
    domain_negative_points += 1;
    page_negative_points -= edge_ranking.scoreAdded
    page_negative_points += 1;
  }

  return {
    rankCode: rankCode,
    edgeID: edge._id,
    positive_points: positive_points,
    negative_points: negative_points,
    domain_positive_points: domain_positive_points,
    domain_negative_points: domain_negative_points,
    page_positive_points: page_positive_points,
    page_negative_points: page_negative_points,
    ranking_date: edge_ranking._id.getTimestamp(),
    ranking_id: edge_ranking.id
    } 
}
module.exports = async function rank_page_to_topic_edge(edgeID, userID, res)
{
    if (!is_page_topic_edge_rank_type_valid(rank_type))
        return res.status(400).send("rank_type is not valid");
    
    var user=await User.findById(userID);
    if (!user)
        return res.status(400).send("User not found in database");

    var edge=await Page_topic_edge.findById(edgeID)
    .select(page_topic_edges_selection)
    .populate(
        page_populate({
            populate: domain_populate()
        }
    ))
    .lean();
    if (!edge)
        return res.status(400).send("Edge not found in database");
    
    var edge_ranking = await Page_topic_edges_ranking.findOne(
        {edge: edge._id, user: user._id, rank_type: rank_type})
        .lean();
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
}