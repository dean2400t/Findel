const Joi = require('joi');
const mongoose = require('mongoose');
const jwt=require('jsonwebtoken')
const config = require('config');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 1024
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isDriver: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  }
});

userSchema.methods.generateAuthToken = function() { 
    const token = jwt.sign({ _id: this._id, password: this.password, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
    return token;
  }
  
  const User = mongoose.model('users', userSchema);
  
  function validateUser(user) {
    const schema = {
      name: Joi.string().min(2).max(50).required(),
      password: Joi.string().min(4).max(255).required(),
      phone: Joi.string().min(5).max(255).required(),
      isDriver:Joi.boolean(),
      isAdmin:Joi.boolean()
    };
  
    return Joi.validate(user, schema);
  }
  
  exports.User = User; 
  exports.validate = validateUser;