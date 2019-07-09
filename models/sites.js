const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  siteURL: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4,
    maxlength: 1024
  },
  siteFormatedURL:{
    type: String,
    required: true,
    minlength: 4,
    maxlength: 1024
  },
  siteSnap:{
    type: String,
    maxlength: 1024
  },
  domain:{
    type: mongoose.Schema.ObjectId, 
    ref: 'domains'
  },
  siteTopicEdges:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'site-Topic-Edges'
  }]
  
});
  
  const Site = mongoose.model('sites', siteSchema);
  
  function validateSite(site) {
    const schema = {
      siteURL: Joi.string().min(4).max(1024).required(),
      siteFormatedURL: Joi.string().min(4).max(1024).required(),
      domain: Joi.objectId().required(),
      siteSnap: Joi.string().max(1024)
    };
    return Joi.validate(site, schema);
  }
  
  exports.Site = Site; 
  exports.validateSite = validateSite;