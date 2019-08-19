const {Topic} = require('../../models/topics');

const {
    topic_selection,
} = require('../../models/common_fields_selection/topic_selections');

const {
    topic_topic_edges_populate
} = require('../../models/common_fields_selection/topic_topic_edges_selections');


module.exports= async function retrieve_connected_topics(topicName, userID, res)
{
    if (userID == '')
      userID == null;

      var topic = await Topic.findOne({topicName:topicName})
      .select(topic_selection({
          userID: userID,
          include_edges: `topic_topic_edges`
        }))
      .populate(topic_topic_edges_populate(
            {
              userID: userID,
              populate: [
                  {
                    path: 'topic1',
                    select: topic_selection()
                  },
                  {
                    path: 'topic2',
                    select: topic_selection()
                  }
              ]
            }))
      .populate()
      .lean();
      
      topic.topic_topic_edges.forEach(edge => {
          
        if (edge.topic1.topicName==topicName)
          edge.topic=edge.topic2;
        else
        edge.topic=edge.topic1;

        edge.topic1= undefined;
        edge.topic2= undefined;
      });
   
   return res.status(200).send(topic);
}