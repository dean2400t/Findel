const parseDomain = require("parse-domain");
const {Topic} = require('../models/topics');
const {TopicTopicEdge} = require('../models/topic_to_topic_edges');
const {topic_save, topic_to_topic_edges_save} = require('../middleware/save_securely_to_database');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res) {
    var dom = parseDomain("sdadsa.com");
    return res.status(200).send("OK");
});

router.get('/test_duplicate_topic', async function(req, res) {
    var topicName = "בדיקה1"
    var topic = new Topic({topicName: topicName});
    topic = await topic_save(topic);
    topic = new Topic({topicName: topicName});
    topic = await topic_save(topic);

    var db_result = await Topic.find({topicName: topicName})
    if (db_result.length == 1)
    {
        await Topic.findOneAndRemove({topicName: topicName});
        return res.status(200).send("OK");
    }
    else
    {
        await Topic.findOneAndRemove({topicName: topicName});
        return res.status(400).send(db_result.length + " where found in database");
    }
    });

router.get('/test_duplicate_topic_edges', async function(req, res) {
    var topicName = "השמש הראשונה";
    var topic1 = new Topic({topicName: topicName});
    topic1 = await topic_save(topic1);
    if (!topic1)
        return res.status(500).send("topic not in database");
    
    topicName = "השנייה השמש";
    topic2 = new Topic({topicName: topicName});
    topic2 = await topic_save(topic2);
    if (!topic2)
        return res.status(500).send("topic not in database");

    topicName = "השלישית השמש";
    topic3 = new Topic({topicName: topicName});
    topic3 = await topic_save(topic3);
    if (!topic3)
        return res.status(500).send("topic not in database");

    var edge1a = new TopicTopicEdge({topic1: topic1._id, topic2: topic2._id});
    var edges = [];
    edges.push(edge1a);
    await topic_to_topic_edges_save(edges);

    var edge1b = new TopicTopicEdge({topic1: topic1._id, topic2: topic2._id});
    var edge2 = new TopicTopicEdge({topic1: topic1._id, topic2: topic3._id});
    var edge3 = new TopicTopicEdge({topic1: topic2._id, topic2: topic3._id});
    edges = [];
    edges.push(edge1b);
    edges.push(edge2);
    edges.push(edge3);
    await topic_to_topic_edges_save(edges);
    return res.status(200).send("OK");
});
module.exports = router;