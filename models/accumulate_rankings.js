const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const accumulate_ranking_Schema = new mongoose.Schema({
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

  user:{
    type: mongoose.Schema.ObjectId, 
    ref: 'users',
    required: true
  },

  positive_rankings:{
    type: Number,
    required: true,
    default: 0
  },

  negative_rankings:{
    type: Number,
    required: true,
    default: 0
  },

  rankings:[
      {
        type: mongoose.Schema.ObjectId, 
        ref: 'rankings'
      }
  ],

  user_score:{
      type: Number,
      required: true,
      default: 0
  },

  rank_type:{
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  }
});
accumulate_ranking_Schema.index({ object_id: 1, object_id_collection:1, user: 1, rank_type: 1}, { unique: true });
  
  const Accumulate_ranking = mongoose.model('accumulate_rankings', accumulate_ranking_Schema);
  
  function validate_accumulate_ranking(accumulate_ranking_Schema) {
    const schema = {
        object_id: Joi.objectId().required(),
        object_id_collection: Joi.string.min(1).max(200),
        user: Joi.objectId().required(),
        rank_type: Joi.string.min(3).max(255).required(),
        rank_code: Joi.Number().required(),
        score_added: Joi.Number().required()
    };
    return Joi.validate(accumulate_ranking_Schema, schema);
  }
  
  exports.Accumulate_ranking = Accumulate_ranking; 
  exports.validate_accumulate_ranking = validate_accumulate_ranking;