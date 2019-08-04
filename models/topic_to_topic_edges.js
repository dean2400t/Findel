const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const topicTopicEdgeSchema = new mongoose.Schema({
  topic1: {
    type: mongoose.Schema.ObjectId, 
    ref: 'topics',
    required: true
  },
  topic2: {
    type: mongoose.Schema.ObjectId, 
    ref: 'topics',
    required: true
  },
  liked_weight:{ 
    type: Number,
    default: 1,
    required: true
  },
  web_scrape_score:{
    type: Number,
    default: 1
  },
  last_web_scrape:{
    type: Date
  },
  usersRanking:
    [{
      type: mongoose.Schema.ObjectId, 
      ref: 'topic-topic-edges-ranking'
    }],
  root_comments:[{
      type: mongoose.Schema.ObjectId, 
      ref: 'comments'
    }]
  
});

topicTopicEdgeSchema.index({ topic1: 1, topic2: 1}, { unique: true });

  const TopicTopicEdge = mongoose.model('topic-topic-edges', topicTopicEdgeSchema);
  
  function validateTopicTopicEdge(topicTopicEdgeSchema) {
    const schema = {
        topic1: Joi.objectId().required(),
        topic2: Joi.objectId().required(),
        weight: Joi.number.required()
    };
    return Joi.validate(topicTopicEdgeSchema, schema);
  }
  
  exports.TopicTopicEdge = TopicTopicEdge; 
  exports.validateTopicTopicEdge = validateTopicTopicEdge;