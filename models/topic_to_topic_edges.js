const Joi = require('joi');
const mongoose = require('mongoose');
const {UserRanking}=require('./userRanking');

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
  weight:{ 
    type: Number,
    required: true
  },
  usersRanking:[UserRanking.schema]
});
  
  const TopicTopicEdge = mongoose.model('topic-topic-edges', topicTopicEdgeSchema);
  
  function validateTopicTopicEdge(topicTopicEdgeSchema) {
    const schema = {
        topic1: Joi.string().min(2).max(100).required(),
        topic2: Joi.string().min(2).max(100).required(),
        weight: Joi.number.required()
    };
    return Joi.validate(topicTopicEdgeSchema, schema);
  }
  
  exports.TopicTopicEdge = TopicTopicEdge; 
  exports.validateTopicTopicEdge = validateTopicTopicEdge;