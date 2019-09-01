const get_score_field_name= require('../../models/common_functions_for_collections/get_score_field_name');
const {rank_domain_remove_accumulate_ranking,
  rank_domain_add_accumulate_ranking}=
  require('../domains/rank_domain_accumulate_ranking_functions');
const {Page} = require('../../models/pages');
const {Ranking}= require('../../models/rankings');

async function object_update_score_function(ranking, page, rank_type, user)
{
  var score_field_name = get_score_field_name(rank_type, ranking.rank_code);
  var field_and_score_in_json = {};
  field_and_score_in_json[score_field_name] = ranking.score_added;


  await Page.findOneAndUpdate({_id: page._id},
    {$inc: field_and_score_in_json, $push: {rankings: ranking._id}});
  page[score_field_name] += ranking.score_added;

  await rank_domain_add_accumulate_ranking(ranking, page.domain, user);
  return true;
}

async function object_remove_score_function(ranking, page, rank_type, user)
{
  var delete_result = await Ranking.deleteOne({_id: ranking._id});
  if (delete_result != null)
    if (delete_result.n == 1)
    {
      var score_field_name = get_score_field_name(rank_type, ranking.rank_code);
      var field_and_score_in_json = {};
      field_and_score_in_json[score_field_name] = -ranking.score_added;

      await Page.findOneAndUpdate({_id: page._id},
        {$inc: field_and_score_in_json, $pull: {rankings: ranking._id}});
        page[score_field_name] -= ranking.score_added;

      await rank_domain_remove_accumulate_ranking(ranking, page.domain, user)

      return true;
    }
  return false
}

function object_ranking_response_function(ranking, page, rank_type, rank_code)
{
  var domain= page.domain;
  var positive_score_field_name = get_score_field_name(rank_type, 1);
  var negative_score_field_name = get_score_field_name(rank_type, 2);

  var positive_points = page[positive_score_field_name];
  var negative_points = page[negative_score_field_name];
  var domain_positive_points = domain[positive_score_field_name];
  var domain_negative_points = domain[negative_score_field_name];
  var page_positive_points = page[positive_score_field_name];
  var page_negative_points = page[negative_score_field_name];

  return {
    rank_code: rank_code,
    pageID: page._id,
    positive_points: positive_points,
    negative_points: negative_points,
    domain_positive_points: domain_positive_points,
    domain_negative_points: domain_negative_points,
    page_positive_points: page_positive_points,
    page_negative_points: page_negative_points,
    ranking_date: ranking._id.getTimestamp(),
    ranking_id: ranking.id
    } 
}

module.exports.object_update_score_function=object_update_score_function;
module.exports.object_remove_score_function=object_remove_score_function;
module.exports.object_ranking_response_function=object_ranking_response_function;