const Joi = require('joi');
const mongoose = require('mongoose');

const topic_Schema = new mongoose.Schema({
  topicName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1,
    maxlength: 1024
  },
  lastGoogleUpdate:{
    type: Date
  },
  last_wikipidia_search:{
    type: Date
  },
  page_topic_edges:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'site-topic-edges'
  }],
  topic_topic_edges:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'topic-topic-edges'
  }],
  root_comments:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'comments'
  }]
});
  
  const Topic = mongoose.model('topics', topic_Schema);
  
  function validate_topic(topic) {
    const schema = {
        topicName: Joi.string().min(1).max(1024).required()
    };
    return Joi.validate(topic, schema);
  }
  
  exports.Topic = Topic; 
  exports.validate_topic = validate_topic;