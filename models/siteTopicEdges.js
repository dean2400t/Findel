const Joi = require('joi');
const mongoose = require('mongoose');
const {UserRanking}=require('./userRanking');

const siteTopicEdgeSchema = new mongoose.Schema({
  site: {
    type: mongoose.Schema.ObjectId, 
    ref: 'sites',
    required: true
  },

  topic: {
    type: mongoose.Schema.ObjectId, 
    ref: 'topics',
    required: true
  },

  lastCalculated:{
    type: Date
  },

  num_of_links_in_site:{
  type: Number
  },

  jaccard_similarity:{
    type: Number
  },
  
  weight:{ 
    type: Number,
    required: true
  },
  order_index_by_google:{ 
    type: Number,
  },
  usersRanking:[UserRanking.schema]
});
  
  const SiteTopicEdge = mongoose.model('site-Topic-Edges', siteTopicEdgeSchema);
  
  function validateSiteTopicEdge(siteTopicEdgeSchema) {
    const schema = {
        site: Joi.string().min(2).max(100).required(),
        topic: Joi.string().min(2).max(100).required(),
        weight: Joi.number.required()
    };
    return Joi.validate(siteTopicEdgeSchema, schema);
  }
  
  exports.SiteTopicEdge = SiteTopicEdge; 
  exports.validateSiteTopicEdge = validateSiteTopicEdge;