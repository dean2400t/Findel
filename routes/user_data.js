var express = require('express');
const auth = require('../middleware/security/auth');
const {User} = require('../models/users');
const {Topic} = require('../models/topics');
const {Site} = require('../models/sites');
const {SiteTopicEdge}=require('../models/siteTopicEdges');
var router = express.Router();

var dateFromObjectId = function (objectId) {
    var date= new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
    var dateFormated=new Intl.DateTimeFormat('he-IL', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(date);
    return dateFormated;
};


function binaryFindSiteByIDs(sites, id, start, end) { 
  if (start > end) return null; 
  let mid=Math.floor((start + end)/2); 
  if (sites[mid]._id.equals(id)) return sites[mid]; 
  if(sites[mid]._id > id)  
      return binaryFindSiteByIDs(sites, id, start, mid-1); 
  else
      return binaryFindSiteByIDs(sites, id, mid+1, end); 
}

function binaryFindTopicByIDs(topics, id, start, end) { 
    if (start > end) return null; 
    let mid=Math.floor((start + end)/2); 
    if (topics[mid]._id.equals(id)) return topics[mid]; 
    if(topics[mid]._id > id)  
        return binaryFindTopicByIDs(topics, id, start, mid-1); 
    else
        return binaryFindTopicByIDs(topics, id, mid+1, end); 
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
    var topic=binaryFindTopicByIDs(topics, topicsIDs[index], 0, topics.length);
    if (topic)
      searches.push({topic: topic.topicName, searchDate: topicSearchDate[index]});
  }
  return res.status(200).send(searches);
});

router.get('/favorites', auth, async function(req, res) {
  
  var user=await User.findById(req.user._id);

  if (!user)
    return res.status(400).send("User not found in database");
  
  var favorites={};
  
  if (user.favorites!=null)
  {
    var edges_ids=[];
    for (var fav_index=0; fav_index<user.favorites.length; fav_index++)
      edges_ids.push(user.favorites[fav_index]);
    var siteTopicEdges=await SiteTopicEdge.find({_id: { $in: edges_ids}});
    var topicsIDs=[];
    var sitesIDs=[];
    siteTopicEdges.forEach(edge => {
      topicsIDs.push(edge.topic);
      sitesIDs.push(edge.site);
    });
    var topics=await Topic.find({_id: { $in: topicsIDs}}).sort();
    var sites=await Site.find({_id: { $in: sitesIDs}}).sort();
    siteTopicEdges.forEach(edge => {
      var topic= binaryFindTopicByIDs(topics, edge.topic._id, 0, topics.length);
      var site= binaryFindSiteByIDs(sites, edge.site._id, 0, sites.length);
      if (favorites[topic.topicName]==null)
        favorites[topic.topicName]=[];
      favorites[topic.topicName].push({siteURL: site.siteURL, formatedURL: site.siteFormatedURL});
    });
    var favorites_array=[];
    Object.keys(favorites).forEach(topic => {
      favorites_array.push({
        topicName: topic,
        sites: favorites[topic]
      })
    });
  }
  return res.status(200).send(favorites_array);
});
module.exports = router;