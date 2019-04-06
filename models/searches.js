const Joi = require('joi');
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
        topic: Joi.string().min(2).max(100).required()
    };
    return Joi.validate(search, schema);
  }
  exports.searchSchema = searchSchema;
  exports.Search = Search; 
  exports.validateSearch = validateSearch;