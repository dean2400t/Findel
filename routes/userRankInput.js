var express = require('express');
const auth = require('../middleware/security/auth');
const {Page} = require('../models/pages');
const {User} = require('../models/users');
const {Domain} = require('../models/domains');
const {Page_topic_edge}=require('../models/page_topic_edges');
const {Topic_topic_edge} = require('../models/topic_to_topic_edges');
const {Page_topic_edges_ranking} = require('../models/page_topic_edges_ranking');
const {Topic_topic_edges_ranking} = require('../models/topic_topic_edges_ranking');

const {Page_ranking} = require('../models/pages_ranking');
const {ranking_save} = require('../middleware/save_securely_to_database');
var router = express.Router();

function is_page_rank_type_valid(rank_type){
  if (rank_type == "credibility" ||
      rank_type == "educational")
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

//Topic to topic ranking


//page to topic ranking



//page rankings
async function insert_ranking_page_to_database(page, user, rank_type, rankCode)
{
  var user_score = user.userScore;
  if (user_score<0)
    user_score = 0;
  var page_ranking = new Page_ranking({
    page: page._id,
    user: user._id,
    rank_type: rank_type,
    rankCode: rankCode,
    scoreAdded: user_score
    });
  if (await ranking_save(page_ranking)==true)
    return page_ranking;
  else
    return null;
  }

async function update_scores_to_page_ranking_insertion(page_ranking, page, domain, user, rank_type)
{
  var score_field_name = get_score_field_name(rank_type, page_ranking.rankCode);
  var field_and_score_in_json = {};
  field_and_score_in_json[score_field_name] = page_ranking.scoreAdded;

  await Domain.findOneAndUpdate({_id: domain._id},
    {$inc: field_and_score_in_json, $push: {pages_usersRanking: page_ranking._id}});
  domain[score_field_name] += page_ranking.scoreAdded;

  await Page.findOneAndUpdate({_id: page._id},
    {$inc: field_and_score_in_json, $push: {page_usersRanking: page_ranking._id}});

  page[score_field_name] += page_ranking.scoreAdded;
  await User.findOneAndUpdate({_id: user._id},
    {$push: {page_ranking: page_ranking._id}});
  return true;
}

async function remove_page_ranking_and_update_scores_in_db(page_ranking, page, domain, user, rank_type)
{
  var delete_result = await Page_ranking.deleteOne(
    {page: page._id, user: user._id, rank_type: rank_type});
  
  if (delete_result != null)
    if (delete_result.n == 1)
    {
      var score_field_name = get_score_field_name(rank_type, page_ranking.rankCode);
      var field_and_score_in_json = {};
      field_and_score_in_json[score_field_name] = -page_ranking.scoreAdded;
      await Domain.findOneAndUpdate({_id: domain._id},
        {$inc: field_and_score_in_json, $pull: {pages_usersRanking: page_ranking._id}});
      domain[score_field_name] -= page_ranking.scoreAdded;

      await Page.findOneAndUpdate({_id: page._id},
        {$inc: field_and_score_in_json, $pull: {page_usersRanking: page_ranking._id}});
        page[score_field_name] -= page_ranking.scoreAdded;

      await User.findOneAndUpdate({_id: user._id},
        {$pull: {pages_ranking: page_ranking._id}});
      return true;
    }
  return false
}

function data_to_return_for_page_ranking(rank_type, rankCode, page_ranking, page, domain)
{
  var positive_score_field_name = get_score_field_name(rank_type, 1);
  var negative_score_field_name = get_score_field_name(rank_type, 2);

  var positive_points = page[positive_score_field_name];
  var negative_points = page[negative_score_field_name];
  var domain_positive_points = domain[positive_score_field_name];
  var domain_negative_points = domain[negative_score_field_name];
  var page_positive_points = page[positive_score_field_name];
  var page_negative_points = page[negative_score_field_name];


  if (rankCode == 1)
  {
    positive_points -= page_ranking.scoreAdded
    positive_points += 1;
    domain_positive_points -= page_ranking.scoreAdded
    domain_positive_points += 1;
    page_positive_points -= page_ranking.scoreAdded
    page_positive_points += 1;
  }
  else if (rankCode == 2)
  {
    negative_points -= page_ranking.scoreAdded
    negative_points += 1;
    domain_negative_points -= page_ranking.scoreAdded
    domain_negative_points += 1;
    page_negative_points -= page_ranking.scoreAdded
    page_negative_points += 1;
  }

  return {
    rankCode: rankCode,
    pageID: page._id,
    positive_points: positive_points,
    negative_points: negative_points,
    domain_positive_points: domain_positive_points,
    domain_negative_points: domain_negative_points,
    page_positive_points: page_positive_points,
    page_negative_points: page_negative_points,
    ranking_date: page_ranking._id.getTimestamp(),
    ranking_id: page_ranking.id
    } 
}

router.post('/rank_page', auth, async function(req, res) {
  
  var pageID=req.body.pageID;
  var rank_type = req.body.rank_type;
  var rankCode=req.body.rankCode;
  if (!pageID)
    return res.status(400).send("No pageID was sent");
  if (!rank_type)
    return res.status(400).send("No rank_type was sent");
  if (!is_page_rank_type_valid(rank_type))
    return res.status(400).send("rank_type is not valid");
  if (!rankCode && rankCode!==0)
    return res.status(400).send("No rank_code was sent");
  if (rankCode<0 || rankCode>2)
    return res.status(400).send("rankCode must be 0, 1, or 2");
  if (!Number.isInteger(rankCode))
  return res.status(400).send("rankCode must be 0, 1, or 2");
    
  var page=await Page.findById(pageID).populate('domain');
  if (!page)
    return res.status(400).send("Page not found in database");

  var user=await User.findById(req.user._id);
  if (!user)
    return res.status(400).send("User not found in database");
  
  var domain= page.domain;
  
  var page_ranking = await Page_ranking.findOne(
    {page: page._id, user: user._id, rank_type: rank_type});
  if (!page_ranking)
  {
    if (rankCode == 0)
      return res.status(400).send("Page is already not ranked");
    else
    {
      page_ranking = await insert_ranking_page_to_database(
        page, user, rank_type, rankCode);
      if (!page_ranking)
        return res.status(400).send("Double request");
      
      if (await update_scores_to_page_ranking_insertion(
        page_ranking, page, domain, user, rank_type) == true)
          return res.status(200).send(data_to_return_for_page_ranking(rank_type, rankCode, page_ranking, page, domain));
    }
  }

  if (page_ranking.rankCode == rankCode)
    if (rankCode == 1 || rankCode == 2)
      return res.status(200).send(data_to_return_for_page_ranking(rank_type, rankCode, page_ranking, page, domain));

  if (await remove_page_ranking_and_update_scores_in_db(
    page_ranking, page, domain, user, rank_type) == true)
  {
    if (rankCode == 0)
      return res.status(200).send(data_to_return_for_page_ranking(rank_type, rankCode, page_ranking, page, domain));
    
    page_ranking = await insert_ranking_page_to_database(
      page, user, rank_type, rankCode);
    if (!page_ranking)
      return res.status(400).send("Double request");
    
    
    if (await update_scores_to_page_ranking_insertion(
      page_ranking, page, domain, user, rank_type)==true)
        return res.status(200).send(data_to_return_for_page_ranking(rank_type, rankCode, page_ranking, page, domain));
  }
  return res.status(400).send("Failed to enter ranking");
});
module.exports = router;