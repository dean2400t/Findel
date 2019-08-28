const {topic_populate}= require('../../models/common_fields_selection/topic_selections'); 
const {User} = require('../../models/users');
const {Topic} = require('../../models/topics');

module.exports= async function search_history(userID, res)
{
  var user=await User.findById(userID)
  .select('searches')
  .populate({
      path: 'searches.topic',
      select: 'topicName'
    })
  .lean();

  if (!user)
    return res.status(400).send("User not found in database");

  user.searches.forEach(search => {
    search.searchDate= search._id.getTimestamp();
  });

  return res.status(200).send(user.searches);
}