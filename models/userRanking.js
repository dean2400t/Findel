const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');


/*
    rankCode:
    1- upvote
    2- downvote
*/
const userRankingSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.ObjectId, 
    ref: 'users',
    unique: true
  },
  rankCode:{
    type: Number,
    required: true
  },
  scoreAdded:{
    type: Number,
    required: true
  }
});
  
  const UserRanking = mongoose.model('users-Ranking', userRankingSchema);
  
  function validateUserRanking(usersRanking) {
    const schema = {
        userID: Joi.objectId().required(),
        rankCode: Joi.Number().required(),
        scoreAdded: Joi.Number().required()
    };
    return Joi.validate(usersRanking, schema);
  }
  
  exports.UserRanking = UserRanking; 
  exports.validateUserRanking = validateUserRanking;