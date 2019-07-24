const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const comment_ranking_Schema = new mongoose.Schema({
  comment:{
    type: mongoose.Schema.ObjectId, 
    ref: 'comments',
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
comment_ranking_Schema.index({ comment: 1, user: 1, rank_type: 1}, { unique: true });
  
  const Comments_ranking = mongoose.model('comments-ranking', comment_ranking_Schema);
  
  function validate_comment_ranking(comment_ranking_Schema) {
    const schema = {
        comment: Joi.objectId().required(),
        user: Joi.objectId().required(),
        rank_type: Joi.string.min(3).max(255).required(),
        rankCode: Joi.Number().required(),
        scoreAdded: Joi.Number().required()
    };
    return Joi.validate(comment_ranking_Schema, schema);
  }
  
  exports.Comments_ranking = Comments_ranking; 
  exports.validate_comment_ranking = validate_comment_ranking;