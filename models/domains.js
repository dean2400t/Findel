const Joi = require('joi');
const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
  domainURL: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4,
    maxlength: 1024
  },

  liked_weight:{
    type: Number,
    default: 1
  },

  trustworthy_weight:{
    type: Number,
    default: 1
    },

  educational_weight:{
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

  usersRanking:
    [{
      type: mongoose.Schema.ObjectId, 
      ref: 'site-topic-edges-ranking'
    }],

  root_comments:[{
      type: mongoose.Schema.ObjectId, 
      ref: 'comments'
    }]
  
});
  
  const Domain = mongoose.model('domains', domainSchema);
  
  function validateDomain(domain) {
    const schema = {
      domainURL: Joi.string().min(4).max(1024).required()
    };
    return Joi.validate(domain, schema);
  }
  
  exports.Domain = Domain;
  exports.validateDomain = validateDomain;