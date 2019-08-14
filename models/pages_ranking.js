const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const page_ranking_Schema = new mongoose.Schema({
  page:{
    type: mongoose.Schema.ObjectId, 
    ref: 'pages',
    required: true
  },

  user:{
    type: mongoose.Schema.ObjectId, 
    ref: 'users',
    required: true
  },

  rank_type:{
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  },

  rankCode:{
    type: Number,
    required: true
  },

  scoreAdded:{
    type: Number,
    required: true
  }
});
page_ranking_Schema.index({ page: 1, user: 1, rank_type: 1}, { unique: true });
  
  const Page_ranking = mongoose.model('pages-ranking', page_ranking_Schema);
  
  function validate_page_ranking(page_ranking_Schema) {
    const schema = {
        edge: Joi.objectId().required(),
        user: Joi.objectId().required(),
        rank_type: Joi.string.min(3).max(255).required(),
        rankCode: Joi.Number().required(),
        scoreAdded: Joi.Number().required()
    };
    return Joi.validate(page_ranking_Schema, schema);
  }
  
  exports.Page_ranking = Page_ranking; 
  exports.validate_page_ranking = validate_page_ranking;