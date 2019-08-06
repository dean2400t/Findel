var express = require('express');
const auth = require('../middleware/security/auth');
const {User} = require('../models/users');
const {Topic} = require('../models/topics');
const {Page} = require('../models/pages');
const {Page_topic_edge}=require('../models/page_topic_edges');
const {Page_topic_edges_ranking} = (require('../models/page_topic_edges_ranking'))
var router = express.Router();

var dateFromObjectId = function (objectId) {
    var date= new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
    var dateFormated=new Intl.DateTimeFormat('he-IL', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(date);
    return dateFormated;
};


function binary_find_page_by_ID(pages, id, start, end) { 
  if (start > end) return null; 
  let mid=Math.floor((start + end)/2); 
  if (pages[mid]._id.equals(id)) return pages[mid]; 
  if(pages[mid]._id > id)  
      return binary_find_page_by_ID(pages, id, start, mid-1); 
  else
      return binary_find_page_by_ID(pages, id, mid+1, end); 
}

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
  
  var positive_liked_rankings = await Page_topic_edges_ranking.find({
    user: user._id, rank_type: "liked", rankCode: 1
  }).populate({ 
    path: 'edge',
    populate: {
      path: 'page topic'
    }
 });
  
  var topic_and_liked_pages = {};
  var favorites =[];
  if (positive_liked_rankings.length>0)
  {
    positive_liked_rankings.forEach(ranking => {
      if (topic_and_liked_pages[ranking.edge.topic._id] == null)
        topic_and_liked_pages[ranking.edge.topic._id] = {
          topic: ranking.edge.topic,
          pages: []
        };
      topic_and_liked_pages[ranking.edge.topic._id].pages.push(ranking.edge.page);
    });
  }
  var favorites =[];
  Object.values(topic_and_liked_pages).forEach(topic_and_liked_pages =>{
    favorites.push(topic_and_liked_pages)
  })
  return res.status(200).send(favorites);
});
module.exports = router;