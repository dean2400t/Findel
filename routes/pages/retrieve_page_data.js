const {Page} = require('../../models/pages');

const {
   page_selection,
} = require('../../models/common_fields_selection/page_selections');

const {
   domain_populate
} = require('../../models/common_fields_selection/domain_selections');

const {
   topic_populate
} = require('../../models/common_fields_selection/topic_selections');

const {
   page_topic_edges_populate
} = require('../../models/common_fields_selection/page_topic_edges_selections');

const {
   page_usersRanking_populate
} = require('../../models/common_fields_selection/ranking_selections');


module.exports= async function retrieve_page_data(pageFormatedURL, userID, res)
{
    if (userID == '')
      userID == null;

   var page = await Page.findOne({pageFormatedURL: pageFormatedURL})
      .select(page_selection(
         {
            include_edges: `page_topic_edges`,
            userID: userID
         }
      ))
      .populate(domain_populate())
      .populate(page_topic_edges_populate(
         {
            userID: userID,
            populate:[
               topic_populate()
            ]
         }))
      .populate(page_usersRanking_populate({userID: userID}))
      .lean();
   
   if (!page)
      return res.status(400).send("Page " + pageURL +" not found in database");
   
   return res.status(200).send(page);
}