const rank= require('../../middleware/rank');

const {Page_topic_edge} = require('../../models/page_topic_edges');

const {page_topic_edges_selection} = require('../../models/common_fields_selection/page_topic_edges_selections');
const {page_populate} = require('../../models/common_fields_selection/page_selections');
const {domain_populate}= require('../../models/common_fields_selection/domain_selections');

function is_page_topic_edge_rank_type_valid(rank_type){
  if (rank_type == "liked")
      return true;
  return false;
}

module.exports = async function rank_page_topic_edge(edgeID, rank_type, rank_code, userID, res)
{ 
  if (!is_page_topic_edge_rank_type_valid(rank_type))
    return res.status(400).send("This ranking: "+ rank_type +" is not allowed for edge");

  var page_topic_edge= await Page_topic_edge.findOne({_id: edgeID})
  .select(page_topic_edges_selection())
  .populate(page_populate({populate:[domain_populate()]}))
  .lean();
  if (!page_topic_edge)
    return res.status(400).send("Edge not found");

  const update_remove_response_handlers= require('./rank_page_topic_edge_update_remove_response_handlers');

  return await rank(
    page_topic_edge, 
    'page-topic-edges', 
    rank_type, 
    rank_code, 
    userID, 
    update_remove_response_handlers,
    res)
}