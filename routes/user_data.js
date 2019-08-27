var express = require('express');
const auth = require('../middleware/security/auth');
const {User} = require('../models/users');
const {Topic} = require('../models/topics');
const {Page} = require('../models/pages');
const {Page_topic_edge}=require('../models/page_topic_edges');
const {Ranking} = (require('../models/rankings'));
var router = express.Router();

var dateFromObjectId = function (objectId) {
    var date= new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
    var dateFormated=new Intl.DateTimeFormat('he-IL', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(date);
    return dateFormated;
};

function binary_find_topic_by_IDs(topics, id, start, end) { 
    if (start > end) return null; 
    let mid=Math.floor((start + end)/2); 
    if (topics[mid]._id.equals(id)) return topics[mid]; 
    if(topics[mid]._id > id)  
        return binary_find_topic_by_IDs(topics, id, start, mid-1); 
    else
        return binary_find_topic_by_IDs(topics, id, mid+1, end); 
  }

router.get('/searchHistory', auth, async function(req, res) {
  
  var user=await User.findById(req.user._id);

  if (!user)
    return res.status(400).send("User not found in database");

  var topicsIDs=[];
  var topicSearchDate=[];
  user.searches.forEach(search => {
    topicsIDs.unshift(search.topic);
    topicSearchDate.unshift(dateFromObjectId(search.id));
  });

  var topics=await Topic.find({_id: { $in: topicsIDs }});
  var searches=[];
  for (var index=0; index<topicsIDs.length; index++)
  {
    var topic=binary_find_topic_by_IDs(topics, topicsIDs[index], 0, topics.length);
    if (topic)
      searches.push({topic: topic.topicName, searchDate: topicSearchDate[index]});
  }
  return res.status(200).send(searches);
});

router.get('/favorites', auth, async function(req, res) {
  
  var user=await User.findById(req.user._id);

  if (!user)
    return res.status(400).send("User not found in database");
  
  var positive_liked_rankings = await Ranking.find({
    user: user._id, object_collection_name: 'page-topic-edges', rank_type: "liked", rankCode: 1
  }).populate({ 
    path: 'edge',
    populate: {
      path: 'page topic'
    }
 });
  
  var topic_and_liked_pages = {};
  if (positive_liked_rankings.length>0)
  {
    positive_liked_rankings.forEach(ranking => {
      if (topic_and_liked_pages[ranking.edge.topic._id] == null)
        topic_and_liked_pages[ranking.edge.topic._id] = {
          topic: ranking.edge.topic,
          pages: [],
          most_recent_ranking: ranking._id.getTimestamp()
        };
      topic_and_liked_pages[ranking.edge.topic._id].pages.push(ranking.edge.page);
      ranking.edge.page.time_ranked_as_favorite = ranking._id.getTimestamp();
      if (topic_and_liked_pages[ranking.edge.topic._id].most_recent_ranking < ranking.edge.page.time_ranked_as_favorite)
        topic_and_liked_pages[ranking.edge.topic._id].most_recent_ranking = ranking.edge.page.time_ranked_as_favorite;
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
});
module.exports = router;