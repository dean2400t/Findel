const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const ranking_Schema = new mongoose.Schema({
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

  rank_type:{
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  },

  rank_code:{
    type: Number,
    required: true
  },

  score_added:{
    type: Number,
    required: true
  }
});
ranking_Schema.index({ object_id: 1, object_collection_name: 1, user: 1, rank_type: 1}, { unique: true });
  
  const Ranking = mongoose.model('rankings', ranking_Schema);
  
  function validate_ranking(ranking_Schema) {
    const schema = {
        object_id: Joi.objectId().required(),
        object_collection_name: Joi.string.min(1).max(200),
        user: Joi.objectId().required(),
        rank_type: Joi.string.min(3).max(255).required(),
        rank_code: Joi.Number().required(),
        score_added: Joi.Number().required()
    };
    return Joi.validate(ranking_Schema, schema);
  }
  
  exports.Ranking = Ranking; 
  exports.validate_ranking = validate_ranking;