const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const search_Schema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.ObjectId, 
    ref: 'topics',
    required:true
  }
});
  
  const Search = mongoose.model('searches', search_Schema);
  
  function validate_search(search) {
    const schema = {
        topic: Joi.objectId().required()
    };
    return Joi.validate(search, schema);
  }
  exports.search_Schema = search_Schema;
  exports.Search = Search; 
  exports.validate_search = validate_search;