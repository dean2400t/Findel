const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const topic_topic_edge_Schema = new mongoose.Schema({
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

  added_by:{
    type: mongoose.Schema.ObjectId, 
    ref: 'users'
  },

  liked_positive_points:{ 
    type: Number,
    required: true,
    default: 0
  },
  liked_negative_points:{ 
    type: Number,
    required: true,
    default: 0
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
    }],

  number_of_comments:{
    type: Number,
    required: true,
    default: 0
  }
  
});

topic_topic_edge_Schema.index({ topic1: 1, topic2: 1}, { unique: true });

  const Topic_topic_edge = mongoose.model('topic-topic-edges', topic_topic_edge_Schema);
  
  function validate_topic_topic_edge(topic_topic_edge_Schema) {
    const schema = {
        topic1: Joi.objectId().required(),
        topic2: Joi.objectId().required(),
        weight: Joi.number.required()
    };
    return Joi.validate(topic_topic_edge_Schema, schema);
  }
  
  exports.Topic_topic_edge = Topic_topic_edge; 
  exports.validate_topic_topic_edge = validate_topic_topic_edge;