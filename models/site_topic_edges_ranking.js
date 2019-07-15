const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const site_topic_edges_ranking_Schema = new mongoose.Schema({
  edge:{
    type: mongoose.Schema.ObjectId, 
    ref: 'site-topic-edges',
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
site_topic_edges_ranking_Schema.index({ edge: 1, user: 1, rank_type: 1}, { unique: true });
  
  const Site_topic_edges_ranking = mongoose.model('site-topic-edges-ranking', site_topic_edges_ranking_Schema);
  
  function validate_site_topic_edges_ranking(site_topic_edges_ranking_Schema) {
    const schema = {
        edge: Joi.objectId().required(),
        user: Joi.objectId().required(),
        rank_type: Joi.string.min(3).max(255).required(),
        rankCode: Joi.Number().required(),
        scoreAdded: Joi.Number().required()
    };
    return Joi.validate(site_topic_edges_ranking_Schema, schema);
  }
  
  exports.Site_topic_edges_ranking = Site_topic_edges_ranking; 
  exports.validate_site_topic_edges_ranking = validate_site_topic_edges_ranking;