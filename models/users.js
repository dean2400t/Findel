const Joi = require('joi');
const mongoose = require('mongoose');
const jwt=require('jsonwebtoken');
const config = require('config');
const {searchSchema} = require('./searches');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    minlength: 5,
    maxlength: 255
  },
  userName:{
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255
  },
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024
  },
  position:
  {
    type: String,
    minlength: 3,
    maxlength: 20
  },
  userScore:
  {
    type: Number
  },
  searches:[searchSchema],
  favorites: [{
    type: mongoose.Schema.ObjectId, 
    ref: 'site-topic-edges'}],
  
  disliked: [{
    type: mongoose.Schema.ObjectId, 
    ref: 'site-topic-edges'}],

  connected_topics_upvoted: [{
    type: mongoose.Schema.ObjectId, 
    ref: 'topic-topic-edges'}],

  connected_topics_downvoted: [{
    type: mongoose.Schema.ObjectId, 
    ref: 'topic-topic-edges'}],
  
  site_Topic_Edges_Added:[{
    type: mongoose.Schema.ObjectId, 
    ref: 'site-topic-edges'
  }]
  });
  
  userSchema.methods.generateAuthToken = function() { 
    var jwtPrivateKey=config.get('jwtPrivateKey');
    if (!jwtPrivateKey)
      var jwtPrivateKey="tru";
    const token = jwt.sign({ _id: this._id, email: this.email, password: this.password, position: this.position}, jwtPrivateKey);
    return token;
  }
  
  const User = mongoose.model('users', userSchema);
  
  function validateUser(user) {
    const schema = {
      email: Joi.string().min(5).max(50),
      userName: Joi.string().min(2).max(50).required(),
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      password: Joi.string().min(4).max(255).required(),
      position: Joi.string().min(3).max(20),
    };
    return Joi.validate(user, schema);
  }
  
  exports.User = User; 
  exports.validate = validateUser;