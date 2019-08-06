const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const page_topic_edge_Schema = new mongoose.Schema({
  page: {
    type: mongoose.Schema.ObjectId, 
    ref: 'pages',
    required: true
  },

  topic: {
    type: mongoose.Schema.ObjectId, 
    ref: 'topics',
    required: true
  },

  order_index_by_google:{ 
    type: Number,
  },

  lastCalculated:{
    type: Date
  },

  num_of_links_in_page:{
  type: Number
  },

  jaccard_similarity:{
    type: Number
  },
  
  liked_weight:{ 
    type: Number,
    required: true,
    default: 1
  },
  credibility_weight:{ 
    type: Number,
    required: true,
    default: 1
  },
  educational_weight:{
    type: Number,
    required: true,
    default: 1
  },
  usersRanking:
    [{
      type: mongoose.Schema.ObjectId, 
      ref: 'page-topic-edges-ranking'
    }],
  root_comments:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'comments'
    }]
});
page_topic_edge_Schema.index({ page: 1, topic: 1}, { unique: true });
  
  const Page_topic_edge = mongoose.model('page-topic-edges', page_topic_edge_Schema);
  
  function validate_page_topic_edge(page_topic_edge_Schema) {
    const schema = {
        site: Joi.objectId().required(),
        topic: Joi.objectId().required(),
        weight: Joi.number.required()
    };
    return Joi.validate(page_topic_edge_Schema, schema);
  }
  
  exports.Page_topic_edge = Page_topic_edge; 
  exports.validate_page_topic_edge = validate_page_topic_edge;