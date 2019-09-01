const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const comment_Scheme = new mongoose.Schema({
  object_id:{
    type: mongoose.Schema.ObjectId,
    required: true
  },
  object_collection_name:{
    type: String,
    required: true,
    minlength: 1,
    maxlength: 200
  },
  user: {
    type: mongoose.Schema.ObjectId, 
    ref: 'users',
    required: true
  },
  text:{
    type: String,
    required: true,
    minlength: 1,
    maxlength: 5000
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
  rankings:
    [{
      type: mongoose.Schema.ObjectId, 
      ref: 'rankings'
    }],

  root_comment: {
    type: mongoose.Schema.ObjectId, 
    ref: 'comments',
    required: true
  },

  number_of_comments:{
    type: Number,
    required: true,
    default: 0
  }
});
comment_Scheme.index({
  text: 1, 
  user: 1, 
  root_comment: 1,
  object_id: 1,
  object_collection_name: 1
  }, { unique: true });

  const Comment = mongoose.model('comments', comment_Scheme);
  
  function validateComment(comment) {
    const schema = {
      text: Joi.string().min(1).max(5000).required()
    };
    return Joi.validate(comment, schema);
  }
  
  exports.Comment = Comment; 
  exports.validateComment = validateComment;