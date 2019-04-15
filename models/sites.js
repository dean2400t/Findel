const Joi = require('joi');
const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  siteURL: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 512
  },
  lastScrape:{
    type: Date
  },
  html:{
    type: String
  },
  siteTopicEdges:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'site-Topic-Edges'
  }]
  
});
  
  const Site = mongoose.model('sites', siteSchema);
  
  function validateSite(site) {
    const schema = {
      siteURL: Joi.string().min(4).max(512).required()
    };
    return Joi.validate(site, schema);
  }
  
  exports.Site = Site; 
  exports.validateSite = validateSite;