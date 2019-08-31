const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  pageURL: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 1024
  },
  pageSnap:{
    type: String,
    maxlength: 1024
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

  credibility_positive_points:{ 
    type: Number,
    required: true,
    default: 0
  },
  credibility_negative_points:{ 
    type: Number,
    required: true,
    default: 0
  },

  educational_positive_points:{ 
    type: Number,
    required: true,
    default: 0
  },
  educational_negative_points:{ 
    type: Number,
    required: true,
    default: 0
  },

  domain:{
    type: mongoose.Schema.ObjectId, 
    ref: 'domains'
  },

  page_topic_edges:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'page-topic-edges'
  }],

  accumulate_rankings:
    [{
      type: mongoose.Schema.ObjectId, 
      ref: 'accumulate_rankings'
    }],

    rankings:
    [{
      type: mongoose.Schema.ObjectId, 
      ref: 'rankings'
    }],
  
    accumulate_rankings:
    [{
      type: mongoose.Schema.ObjectId, 
      ref: 'accumulate-rankings'
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
  
  const Page = mongoose.model('pages', pageSchema);
  
  function validateSite(page) {
    const schema = {
      pageURL: Joi.string().min(4).max(1024).required(),
      pageFormatedURL: Joi.string().min(4).max(1024).required(),
      domain: Joi.objectId().required(),
      pageSnap: Joi.string().max(1024)
    };
    return Joi.validate(page, schema);
  }
  
  exports.Page = Page; 
  exports.validateSite = validateSite;