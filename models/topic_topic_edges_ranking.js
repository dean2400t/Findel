const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const topic_topic_edges_ranking_Schema = new mongoose.Schema({
  edge:{
    type: mongoose.Schema.ObjectId, 
    ref: 'topic-topic-edges',
    required: true
  },

  user:{
    type: mongoose.Schema.ObjectId, 
    ref: 'users',
    required: true
  },

  rank_type:{
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  },

  rankCode:{
    type: Number,
    required: true
  },

  scoreAdded:{
    type: Number,
    required: true
  }
});
topic_topic_edges_ranking_Schema.index({ edge: 1, user: 1, rank_type: 1}, { unique: true });
  
  const Topic_topic_edges_ranking = mongoose.model('topic-topic-edges-ranking', topic_topic_edges_ranking_Schema);
  
  function validate_topic_topic_edges_ranking(topic_topic_edges_ranking_Schema) {
    const schema = {
        edge: Joi.objectId().required(),
        user: Joi.objectId().required(),
        rank_type: Joi.string.min(3).max(255).required(),
        rankCode: Joi.Number().required(),
        scoreAdded: Joi.Number().required()
    };
    return Joi.validate(topic_topic_edges_ranking_Schema, schema);
  }
  
  exports.Topic_topic_edges_ranking = Topic_topic_edges_ranking; 
  exports.validate_topic_topic_edges_ranking = validate_topic_topic_edges_ranking;