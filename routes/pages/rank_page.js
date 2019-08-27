const rank= require('../../middleware/rank');

const {Page} = require('../../models/pages');

const {page_selection} = require('../../models/common_fields_selection/page_selections');
const {domain_populate} = require('../../models/common_fields_selection/domain_selections');

function is_page_rank_type_valid(rank_type){
  if (rank_type == "credibility" ||
      rank_type == "educational")
      return true;
  return false;
}

module.exports = async function rank_page(pageID, rank_type, rank_code, userID, res)
{ 
  if (!is_page_rank_type_valid(rank_type))
    return res.status(400).send("This ranking: "+ rank_type +" is not allowed for page");

  var page= await Page.findOne({_id: pageID})
  .select(page_selection())
  .populate(domain_populate())
  .lean();
  if (!page)
    return res.status(400).send("Page not found");

  const update_remove_response_handlers= require('./rank_page_update_remove_response_handlers');

  return await rank(
    page, 
    'pages', 
    rank_type, 
    rank_code, 
    userID, 
    update_remove_response_handlers,
    res)
}