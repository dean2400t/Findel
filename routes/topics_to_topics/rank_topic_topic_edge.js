const rank= require('../../middleware/rank');

const {Topic_topic_edge} = require('../../models/topic_topic_edges');

const {topic_topic_edges_selection} = require('../../models/common_fields_selection/topic_topic_edges_selections');

function is_topic_topic_edge_rank_type_valid(rank_type){
  if (rank_type == "liked")
      return true;
  return false;
}

module.exports = async function rank_page_topic_edge(edgeID, rank_type, rank_code, userID, res)
{ 
  if (!is_topic_topic_edge_rank_type_valid(rank_type))
    return res.status(400).send("This ranking: "+ rank_type +" is not allowed for edge");

  var topic_topic_edge= await Topic_topic_edge.findOne({_id: edgeID})
  .select(topic_topic_edges_selection())
  .lean();
  if (!topic_topic_edge)
    return res.status(400).send("Edge not found");

  const update_remove_response_handlers= require('./rank_topic_topic_edge_update_remove_response_handlers');

  return await rank(
    topic_topic_edge, 
    'topic-topic-edges', 
    rank_type, 
    rank_code, 
    userID, 
    update_remove_response_handlers,
    res)
}