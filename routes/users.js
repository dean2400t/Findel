const auth = require('../middleware/auth');
const admin=require('../middleware/admin');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User, validate} = require('../models/users');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("name -_id");
  res.send(user);
});

router.post('/', [auth, admin],async (req, res) => {

  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  var user = await User.findOne({ name: req.body.name });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'password', 'phone']));
  
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'password', "isAdmin"]));
});

router.put('/:id', [auth, admin],async (req, res) =>
{
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const salt = await bcrypt.genSalt(10);
  var hashedPassword=await bcrypt.hash(req.body.password, salt);

  const user = await User.findByIdAndUpdate(req.params.id,
    { 
      name: req.body.name,
      password: hashedPassword,
      isAdmin: req.body.isAdmin,
      isDriver: req.body.isDriver
    }, { new: true });
  
  
  if (!user) return res.status(404).send('The user with the given ID was not found.');
  
  res.send(user);
});

router.delete('/:id', [auth, admin],async (req, res) =>
{
  const user = await User.findByIdAndRemove(req.params.id);

  if (!user) return res.status(404).send('The user with the given ID was not found.');

  res.send(user);
});

module.exports = router; 
