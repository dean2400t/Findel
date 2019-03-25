const Joi = require('joi');
const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.ObjectId, 
    ref: 'topics',
    required:true
  },
  user:{
    type: mongoose.Schema.ObjectId, 
    ref: 'users',
    required:true
  }
  
});
  
  const Search = mongoose.model('searches', searchSchema);
  
  function validateSearch(search) {
    const schema = {
      siteURL: Joi.string().min(4).max(512).required()
    };
    return Joi.validate(search, schema);
  }
  
  exports.Search = Search; 
  exports.validateSearch = validateSearch;