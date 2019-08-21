router.post('/connect_topic_to_topic', auth, async function(req, res) {
  
    var new_topicName=req.body.new_topicName;
    var current_topicName = req.body.current_topicName;
    if (!new_topicName)
        return res.status(400).send("אין נושא חדש לחבר בגוף הבקשה");
    if (current_topicName=="")
        return res.status(400).send("אין נושא ישן לחבר בגוף הבקשה");
    var user=await User.findById(req.user._id);
    if (!user)
        return res.status(400).send("User not found in database");

    var new_topic= await Topic.findOne({topicName: new_topicName});
    if (!new_topic)
    {
        new_topic = new Topic({topicName: new_topicName});
        new_topic = await topic_save(new_topic);
    }

    var current_topic= await Topic.findOne({topicName: current_topicName});
    if (!current_topic)
    {
        current_topic = new Topic({topicName: current_topicName});
        current_topic = await topic_save(current_topic);
    }

    
    if (new_topic.topicName < current_topic.topicName)
    {
        var topic1 = new_topic;
        var topic2 = current_topic
    }
    else
    {
        var topic1 = current_topic;
        var topic2 = new_topic
    }

    var topic_topic_edge= await Topic_topic_edge.findOne({$and: [{topic1: topic1._id}, {topic2: topic2._id}]});
    if (topic_topic_edge)
    {
        var msg="קיים חיבור בין " + topic1.topicName + " ל" + topic2.topicName;
        return res.status(400).send(msg)
    }

    topic_topic_edge=new Topic_topic_edge({topic1: topic1._id, topic2: topic2._id, added_by: user._id});
    topic_topic_edge = await topic_to_topic_edge_save(topic_topic_edge);
    await Topic.updateOne({_id: topic1._id}, {$addToSet: {topic_topic_edges: topic_topic_edge._id}});
    await Topic.updateOne({_id: topic2._id}, {$addToSet: {topic_topic_edges: topic_topic_edge._id}});
    var msg="נוצר חיבור בין " + topic1.topicName + " ל" + topic2.topicName;
    return res.status(200).send(msg);
});