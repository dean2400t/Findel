const get_score_field_name= require('../../middleware/get_score_field_name');

const {Comment}= require('../../models/comments')
const {Ranking}= require('../../models/rankings');

async function object_update_score_function(ranking, comment, rank_type)
{
  var score_field_name = get_score_field_name(rank_type, ranking.rank_code);
  var field_and_score_in_json = {};
  field_and_score_in_json[score_field_name] = ranking.score_added;

  await Comment.findOneAndUpdate({_id: comment._id},
    {$inc: field_and_score_in_json, $push: {rankings: ranking._id}});
    comment[score_field_name] += ranking.score_added;

  return true;
}

async function object_remove_score_function(ranking, comment, rank_type)
{
  var delete_result = await Ranking.deleteOne({_id: ranking._id});
  if (delete_result != null)
    if (delete_result.n == 1)
    {
      var score_field_name = get_score_field_name(rank_type, ranking.rank_code);
      var field_and_score_in_json = {};
      field_and_score_in_json[score_field_name] = -ranking.score_added;

      await Comment.findOneAndUpdate({_id: comment._id},
        {$inc: field_and_score_in_json, $pull: {rankings: ranking._id}});
      comment[score_field_name] -= ranking.score_added;
      return true;
    }
  return false
}

function object_ranking_response_function(ranking, comment, rank_type, rank_code)
{
  var positive_score_field_name = get_score_field_name(rank_type, 1);
  var negative_score_field_name = get_score_field_name(rank_type, 2);

  var positive_points = comment[positive_score_field_name];
  var negative_points = comment[negative_score_field_name];

  if (rank_code == 1)
  {
    positive_points -= ranking.score_added
    positive_points += 1;
  }
  else if (rank_code == 2)
  {
    negative_points -= ranking.score_added
    negative_points += 1;
  }

  return {
    rank_code: rank_code,
    commentID: comment._id,
    positive_points: positive_points,
    negative_points: negative_points,
    ranking_date: ranking._id.getTimestamp(),
    ranking_id: ranking.id
    } 
}

module.exports.object_update_score_function=object_update_score_function;
module.exports.object_remove_score_function=object_remove_score_function;
module.exports.object_ranking_response_function=object_ranking_response_function;