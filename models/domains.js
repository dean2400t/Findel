const Joi = require('joi');
const mongoose = require('mongoose');

const domain_Schema = new mongoose.Schema({
  domainURL: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
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

  pages:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'pages'
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
    }]
  
});
  domain_Schema.index({
    domainURL: 1
    }, { unique: true });
  
  const Domain = mongoose.model('domains', domain_Schema);
  
  function validate_domain(domain) {
    const schema = {
      domainURL: Joi.string().min(4).max(1024).required()
    };
    return Joi.validate(domain, schema);
  }
  
  exports.Domain = Domain;
  exports.validate_domain = validate_domain;