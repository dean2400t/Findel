const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.ObjectId, 
    ref: 'topics',
    required:true
  }
});
  
  const Search = mongoose.model('searches', searchSchema);
  
  function validateSearch(search) {
    const schema = {
        topic: Joi.objectId().required()
    };
    return Joi.validate(search, schema);
  }
  exports.searchSchema = searchSchema;
  exports.Search = Search; 
  exports.validateSearch = validateSearch;