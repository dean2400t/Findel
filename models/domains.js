const Joi = require('joi');
const mongoose = require('mongoose');
const {UserRanking}=require('./userRanking');

const domainSchema = new mongoose.Schema({
  domainURL: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4,
    maxlength: 1024
  },

  score:{
  type: Number,
  default: 1
  },

  is_verified:{
    type: Boolean
  },

  sites:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'sites'
  }],

  userRankings: [UserRanking.schema]
  
});
  
  const Domain = mongoose.model('domains', domainSchema);
  
  function validateDomain(domain) {
    const schema = {
      domainURL: Joi.string().min(4).max(512).required()
    };
    return Joi.validate(domain, schema);
  }
  
  exports.Domain = Domain;
  exports.validateDomain = validateDomain;