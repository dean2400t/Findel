const Joi = require('joi');
const mongoose = require('mongoose');


/*
    rankCode:
    1- upvote
    2- downvote
*/
const userRankingSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.ObjectId, 
    ref: 'users'
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
        userID: Joi.string().min(1).max(255).required(),
        rankCode: Joi.Number().required(),
        scoreAdded: Joi.Number().required()
    };
    return Joi.validate(usersRanking, schema);
  }
  
  exports.UserRanking = UserRanking; 
  exports.validateUserRanking = validateUserRanking;