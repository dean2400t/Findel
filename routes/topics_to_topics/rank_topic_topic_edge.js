const get_score_field_name= require('../../middleware/get_score_field_name');
const {ranking_save} = require('../../middleware/save_securely_to_database');

const {Topic_topic_edge} = require('../../models/topic_to_topic_edges');
const {Topic_topic_edges_ranking} = require('../../models/topic_topic_edges_ranking');
const {User} = require('../../models/users');

function is_topic_topic_edge_rank_type_valid(rank_type){
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
async function update_scores_to_topic_topic_ranking_edge_insertion(edge_ranking, edge, user, rank_type)
{
    var score_field_name = get_score_field_name(rank_type, edge_ranking.rankCode);

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
        var score_field_name = get_score_field_name(rank_type, edge_ranking.rankCode);

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
    var positive_score_field_name = get_score_field_name(rank_type, 1);
    var negative_score_field_name = get_score_field_name(rank_type, 2);

    var positive_points = edge[positive_score_field_name];
    var negative_points = edge[negative_score_field_name];

    if (rankCode == 1)
    {
        positive_points -= edge_ranking.scoreAdded
        positive_points += 1;
    }
    else if (rankCode == 2)
    {
        negative_points -= edge_ranking.scoreAdded
        negative_points += 1;
    }

    return {
        rankCode: rankCode,
        edgeID: edge._id,
        positive_points: positive_points,
        negative_points: negative_points,
        edge_ranking_date: edge_ranking._id.getTimestamp(),
        edge_ranking_id: edge_ranking.id
        } 
}
  
module.exports = async function rank_topic_to_topic_edge(edgeID, rank_type, rankCode, userID, res)
{
    if (!is_topic_topic_edge_rank_type_valid(rank_type))
        return res.status(400).send("rank_type is not valid");

    var edge=await Topic_topic_edge.findById(edgeID)
    .populate({
        path: 'topic1',
        select: '_id'
    }).populate({
        path: 'topic2',
        select: '_id'
    })
    .lean();

    if (!edge)
      return res.status(400).send("Edge not found in database");
  
    var topic1 = edge.topic1;
    if (!topic1)
      return res.status(400).send("Topic1 not found in database");
  
    var topic2 = edge.topic2;
    if (!topic2)
      return res.status(400).send("Topic2 not found in database");
  
    var user=await User.findById(userID)
    .select('_id')
    .lean();
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
            edge_ranking, edge, user, rank_type, rankCode) == true)
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
            Topic_topic_edges_ranking, edge, user, rank_type);
        if (!edge_ranking)
            return res.status(400).send("Double request");
        
        
        if (await update_scores_to_topic_topic_ranking_edge_insertion(
            edge_ranking, edge, user, rank_type)==true)
            return res.status(200).send(data_to_return_for_topic_topic_edge_ranking(
                rank_type, rankCode, edge_ranking, edge));
    }
    return res.status(400).send("Failed to enter ranking");
};