const Joi = require('joi');
const mongoose = require('mongoose');
const {UserRanking}=require('./userRanking');

const domainSchema = new mongoose.Schema({
  domainURL: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 512
  },

  score:{
  type: Number
  },

  is_verified:{
    type: Boolean
  },

  sites:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'sites'
  }],

  userRankings: [UserRanking]
  
});
  
  const Site = mongoose.model('sites', siteSchema);
  
  function validateSite(site) {
    const schema = {
      siteURL: Joi.string().min(4).max(512).required(),
      siteFormatedURL: Joi.string().min(4).max(512).required(),
      siteSnap: Joi.string().max(1024)
    };
    return Joi.validate(site, schema);
  }
  
  exports.Site = Site; 
  exports.validateSite = validateSite;