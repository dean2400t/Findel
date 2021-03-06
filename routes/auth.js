const Joi = require('joi');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User} = require('../models/users');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error)
    return res.status(400).send(error.details[0].message);
  let user = await User.findOne({ userName: req.body.userName });
  if (!user) return res.status(400).send('שם משתמש או סיסמא שגויים');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('שם משתמש או סיסמא שגויים');

  const token = user.generateAuthToken();
  var dataToSend= {
                      token:token,
                      userID:user.id
                    };
  res.status(200);
  res.send(dataToSend);
});

function validate(req) {
  const schema = {
    userName: Joi.string().min(2).max(255).required(),
    password: Joi.string().min(6).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router; 
