const Joi = require('joi');
const mongoose = require('mongoose');

const domain_Schema = new mongoose.Schema({
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

  credibility_weight:{
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

  pages:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'pages'
  }],

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
  
  const Domain = mongoose.model('domains', domain_Schema);
  
  function validate_domain(domain) {
    const schema = {
      domainURL: Joi.string().min(4).max(1024).required()
    };
    return Joi.validate(domain, schema);
  }
  
  exports.Domain = Domain;
  exports.validate_domain = validate_domain;