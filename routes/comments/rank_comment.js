const get_score_field_name= require('../../middleware/get_score_field_name');
const {ranking_save} = require('../middleware/save_securely_to_database');

const {Comments_ranking} = require('../models/comments_rankings');
const {Comment} = require('../models/comments');
const {ranking_save} = require('../../middleware/save_securely_to_database');

function is_comment_rank_type_valid(rank_type){
  if (rank_type == "liked")
      return true;
  return false;
}

async function insert_comment_ranking_to_database(comment, user, rank_type, rankCode)
{
  var user_score = user.userScore;
  if (user_score<0)
    user_score = 0;

  var comment_ranking = new Comments_ranking({
    comment: comment._id,
    user: user._id,
    rank_type: rank_type,
    rankCode: rankCode,
    scoreAdded: user_score
    });
  if (await ranking_save(comment_ranking)==true)
    return comment_ranking;
  else
    return null;
}

async function update_scores_to_comment_ranking_insertion(comment_ranking, comment, user, rank_type)
{
  var score_field_name = get_score_field_name(rank_type, comment_ranking.rankCode);
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
  var positive_points = comment[get_score_field_name(rank_type, 1)];
  var negative_points = comment[get_score_field_name(rank_type, 2)];

  if (rankCode == 1)
  {
    positive_points -= comment_ranking.scoreAdded
    positive_points += 1;
  }
  else if (rankCode == 2)
  {
    negative_points -= comment_ranking.scoreAdded
    negative_points += 1;
  }

  return {
    rankCode: rankCode,
    commentID: comment._id,
    positive_points: positive_points,
    negative_points: negative_points,
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
      var score_field_name = get_score_field_name(rank_type, comment_ranking.rankCode);
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

module.exports=async function rank_comment(commentID, rank_type, rankCode, userID, res)
{
    if (!is_comment_rank_type_valid(rank_type))
      return res.status(400).send("rank_type is not valid");
    var comment=await Comment.findById(commentID)
    .select('_id')
    .lean();
    if (!comment)
        return res.status(400).send("Comment not found in database");

    var user=await User.findById(req.user._id)
    .select('_id userScore')
    .lean();
    if (!user)
        return res.status(400).send("User not found in database");
    
    var comment_ranking = await Comments_ranking.findOne(
        {comment: comment._id, user: user._id, rank_type: rank_type})
        .lean();
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
}