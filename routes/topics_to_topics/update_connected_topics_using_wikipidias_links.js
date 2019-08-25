const retrieve_topic_and_connected_topics= require('./retrieve_topic_and_connected_topics');

function binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, start, end) { 
    if (start > end) return null; 
 
    let mid=Math.floor((start + end)/2); 
    if (topics_and_edges_array[mid].topic.topicName===link_name) return topics_and_edges_array[mid]; 
    if(topics_and_edges_array[mid].topic.topicName > link_name)  
        return binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, start, mid-1); 
    else
        return binary_search_topic_and_edge_in_topics_and_edges_array(topics_and_edges_array, link_name, mid+1, end); 
  }



module.exports= async function update_connected_topics_using_wikipidias_links(topic, links_name_array, userID){
  if (topic.last_wikipidia_search!=null)
  {
    var last_wikipidia_search=new Date() - topic.last_wikipidia_search;
    var numOfDaysToLive=3;
    if (last_wikipidia_search<numOfDaysToLive*86400000)
        return
  }
  var topic= await retrieve_topic_and_connected_topics(topic, null, null);
  var topic_topic_edges= topic.topic_topic_edges;
  var edge_to_topic_of_link_name=null;
  var new_edges_id_array=[];

  if (topic_topic_edges.length>0)
  {
    topic_topic_edges.sort((edge_a, edge_b) => {if (edge_b.topic.topicName>edge_a.topic.topicName) return 1 ; else return -1;});
    await Promise.all(links_name_array.map(async (link_name) => {
        edge_to_topic_of_link_name = binary_search_topic_and_edge_in_topics_and_edges_array(topic_topic_edges, link_name, 0, topic_topic_edges.length-1);
        if (!edge_to_topic_of_link_name)
        {
            var newTopic=new Topic({topicName: link_name});
            newTopic = await topic_save(newTopic);
            if (topic.topicName < newTopic.topicName)
                var new_topic_to_topic_edge=new Topic_topic_edge({topic1: topic._id, topic2: newTopic._id});
            else
                var new_topic_to_topic_edge=new Topic_topic_edge({topic1: newTopic._id, topic2: topic._id});

            new_topic_to_topic_edge = await topic_to_topic_edge_save(new_topic_to_topic_edge);
            if (new_topic_to_topic_edge)
            {
                await Topic.findOneAndUpdate({_id: newTopic._id}, {$addToSet: {topic_topic_edges: new_topic_to_topic_edge}});
                new_edges_id_array.push(new_topic_to_topic_edge._id);
            }
        }
    }));
  }
  else
    await Promise.all(links_name_array.map(async (link_name) => {
        var newTopic=new Topic({topicName: link_name});
        newTopic = await topic_save(newTopic);
        if (topic.topicName < newTopic.topicName)
            var new_topic_to_topic_edge=new Topic_topic_edge({topic1: topic._id, topic2: newTopic._id});
        else
            var new_topic_to_topic_edge=new Topic_topic_edge({topic1: newTopic._id, topic2: topic._id});
        new_topic_to_topic_edge = await topic_to_topic_edge_save(new_topic_to_topic_edge);
        if (new_topic_to_topic_edge)
        {
            await Topic.findOneAndUpdate({_id: newTopic._id}, {$addToSet: {topic_topic_edges: new_topic_to_topic_edge}});
            new_edges_id_array.push(new_topic_to_topic_edge._id);
        }
    }));
    if (new_edges_id_array.length>0)
        await Topic.findOneAndUpdate({_id: topic._id}, {$addToSet: {topic_topic_edges: {$each: new_edges_id_array}}, last_wikipidia_search: Date.now()});
}