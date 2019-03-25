const Joi = require('joi');
const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  topicName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  },
  lastGoogleUpdate:{
    type: Date,
    required: true
  },
  siteTopicEdges:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'siteTopicEdges'
  }]
});
  
  const Topic = mongoose.model('topics', topicSchema);
  
  function validateTopic(topic) {
    const schema = {
        topicName: Joi.string().min(1).max(255).required()
    };
    return Joi.validate(topic, schema);
  }
  
  exports.Topic = Topic; 
  exports.validateTopic = validateTopic;