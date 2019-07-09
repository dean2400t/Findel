const Joi = require('joi');
const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
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
  siteTopicEdges:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'site-topic-edges'
  }],
  topicTopicEdges:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'topic-topic-edges'
  }]
});
  
  const Topic = mongoose.model('topics', topicSchema);
  
  function validateTopic(topic) {
    const schema = {
        topicName: Joi.string().min(1).max(1024).required()
    };
    return Joi.validate(topic, schema);
  }
  
  exports.Topic = Topic; 
  exports.validateTopic = validateTopic;