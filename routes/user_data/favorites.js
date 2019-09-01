const {User} = require('../../models/users');
const {Ranking} = (require('../../models/rankings'));

const {rankings_selection}= require('../../models/common_fields_selection/rankings_selections');
const {page_topic_edges_selection}= require('../../models/common_fields_selection/page_topic_edges_selections');
const {topic_populate}=require('../../models/common_fields_selection/topic_selections');
const {page_populate}= require('../../models/common_fields_selection/page_selections');
module.exports= async function favorites(userID, res)
{
  var user=await User.findById(userID);

  if (!user)
    return res.status(400).send("User not found in database");
  
  var positive_liked_rankings = await Ranking.find({
    user: user._id, object_collection_name: 'page-topic-edges', rank_type: "liked", rank_code: 1
  })
  .select(rankings_selection(
    {
      include_edges: 'object_id'
    }
  ))
  .populate(
  [
    {
      path: 'object_id',
      model: 'page-topic-edges',
      select: page_topic_edges_selection(),
      populate:
      [
          topic_populate(),
          page_populate()
      ]
    }
  ])
  .lean();
  
  var topic_and_liked_pages = {};
  if (positive_liked_rankings.length>0)
  {
    positive_liked_rankings.forEach(ranking => {
      var edge= ranking.object_id;
      if (topic_and_liked_pages[edge.topic._id] == null)
        topic_and_liked_pages[edge.topic._id] = {
          topic: edge.topic,
          pages: [],
          most_recent_ranking: ranking._id.getTimestamp()
        };
      topic_and_liked_pages[edge.topic._id].pages.push(edge.page);
      edge.page.time_ranked_as_favorite = ranking._id.getTimestamp();
      if (topic_and_liked_pages[edge.topic._id].most_recent_ranking < edge.page.time_ranked_as_favorite)
        topic_and_liked_pages[edge.topic._id].most_recent_ranking = edge.page.time_ranked_as_favorite;
    });
  }

  var favorites =[];
  Object.values(topic_and_liked_pages).forEach(topic_and_liked_pages =>{
    favorites.push(topic_and_liked_pages)
  })
  
  favorites.sort((favorite1, favorite2) => {
    return favorite2.most_recent_ranking - favorite1.most_recent_ranking;
  });

  favorites.forEach(favorite => {
    favorite.pages.sort((page1, page2) => {
      return page2.time_ranked_as_favorite - page1.time_ranked_as_favorite
    })
  });

  return res.status(200).send(favorites);
}