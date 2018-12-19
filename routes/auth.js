const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User} = require('../models/users');
const express = require('express');
const router = express.Router();

router.get('/logout', async (req, res) => {
  res.cookie('auth',null);
  res.redirect(`/`);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ name: req.body.name });
  if (!user) return res.status(400).send('Invalid name or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid name or password.');

  const token = user.generateAuthToken();
  res.cookie('auth',token);
  res.redirect(`/`);
  res.send(token);
});

function validate(req) {
  const schema = {
    name: Joi.string().min(3).max(255).required(),
    password: Joi.string().min(4).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router; 
