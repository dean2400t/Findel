const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User} = require('../models/users');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send("Missing field email or password");

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

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
    email: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(6).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router; 
