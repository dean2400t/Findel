const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  pageURL: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4,
    maxlength: 1024
  },
  pageFormatedURL:{
    type: String,
    required: true,
    minlength: 4,
    maxlength: 1024
  },
  pageSnap:{
    type: String,
    maxlength: 1024
  },
  domain:{
    type: mongoose.Schema.ObjectId, 
    ref: 'domains'
  },
  page_topic_edges:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'page-topic-edges'
  }],
  root_comments:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'comments'
  }]
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