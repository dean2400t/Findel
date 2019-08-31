const rank= require('../../models/common_functions_for_collections/ranking_functions/rank');

const {Comment} = require('../../models/comments');

const {comment_selection} = require('../../models/common_fields_selection/comment_selections');

function is_comment_rank_type_valid(rank_type){
  if (rank_type == "liked")
      return true;
  return false;
}

module.exports = async function rank_comment(commentID, rank_type, rank_code, userID, res)
{ 
  if (!is_comment_rank_type_valid(rank_type))
    return res.status(400).send("This ranking: "+ rank_type +" is not allowed for edge");

  var comment= await Comment.findOne({_id: commentID})
  .select(comment_selection())
  .lean();
  if (!comment)
    return res.status(400).send("Comment not found");

  const update_remove_response_handlers= require('./rank_comment_update_remove_response_handlers');

  return await rank(
    comment, 
    'comments', 
    rank_type, 
    rank_code, 
    userID, 
    update_remove_response_handlers,
    res)
}