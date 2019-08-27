const {Ranking} = require('../models/rankings');
const {User}= require('../models/users');
const {ranking_save} = require('./save_securely_to_database');
  
async function insert_ranking_to_database(object_id, object_collection_name, user, rank_type, rank_code)
{
  var user_score = user.user_score;
  if (user_score<0)
    user_score = 0;
  var ranking = new Ranking({
    object_id: object_id,
    object_collection_name: object_collection_name,
    user: user._id,
    rank_type: rank_type,
    rank_code: rank_code,
    score_added: user_score
    });
  if (await ranking_save(ranking)==true)
    return ranking;
  else
    return null;
  }

module.exports = async function rank(
  object,
  object_collection_name,
  rank_type,
  rank_code,
  userID,
  update_remove_response_handlers,
  res)
{ 
  const {object_update_score_function, 
    object_remove_score_function, 
    object_ranking_response_function} = update_remove_response_handlers;
  var user= await User.findById(userID)
  .select('_id user_score')
  .lean();
  if (!user)
    return res.status(400).send("User not found in database");
  
  var ranking = await Ranking.findOne(
    {object_id: object._id, object_collection_name: object_collection_name, user: user._id, rank_type: rank_type});
  if (!ranking)
  {
    if (rank_code == 0)
      return res.status(400).send("Already not ranked");
    else
    {
      ranking = await insert_ranking_to_database(
        object._id, object_collection_name, user, rank_type, rank_code);
      if (!ranking)
        return res.status(400).send("Double request");
      
      if (await object_update_score_function(
        ranking, object, rank_type) == true)
          return res.status(200).send(object_ranking_response_function(ranking, object, rank_type, rank_code));
    }
  }

  if (ranking.rank_code == rank_code)
    if (rank_code == 1 || rank_code == 2)
      return res.status(200).send(object_ranking_response_function(ranking, object, rank_type, rank_code));

  if (await object_remove_score_function(
    ranking, object, rank_type) == true)
    {
      if (rank_code == 0)
        return res.status(200).send(object_ranking_response_function(ranking, object, rank_type, rank_code));
      
      ranking = await insert_ranking_to_database(
        object._id, object_collection_name, user, rank_type, rank_code);
      if (!ranking)
        return res.status(400).send("Double request");
      
      
      if (await object_update_score_function(
        ranking, object, rank_type)==true)
          return res.status(200).send(object_ranking_response_function(ranking, object, rank_type, rank_code));
    }
  return res.status(400).send("Failed to enter ranking");
}