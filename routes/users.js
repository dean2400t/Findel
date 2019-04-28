const auth = require('../middleware/security/auth');
const isAdmin=require('../middleware/security/isAdmin');
const isAdminOrTheUser=require('../middleware/security/isAdminOrTheUser')
const isTeacher=require('../middleware/security/isTeacher');
const isStudent=require('../middleware/security/isStudent');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validate} = require('../models/users');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("_id userName position");
  res.send(user);
});
//,[auth, isAdmin]
router.post('/createAdminAccount', async (req, res) => {

  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  var user = await User.findOne({ userName: req.body.userName });
  if (user) return res.status(400).send('userName already exist.');

  if (req.body.email!="" && req.body.email!=null)
  {
    var user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('email already exist.');
  }

  req.body.position="Admin";
  user = new User(_.pick(req.body, ['email', 'userName', 'firstName', 'lastName', 'password', 'position']));
  
  user.userScore=50;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  
  await user.save();

  const token = user.generateAuthToken();
  return res.status(200).send({token: token, userName: user.userName});
});

router.post('/createStudentAccount', async (req, res) => {

  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  var user = await User.findOne({ userName: req.body.userName });
  if (user) return res.status(400).send('userName already exist.');

  if (req.body.email!="" && req.body.email!=null)
  {
    var user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('email already exist.');
  }
  
  req.body.position="Student";
  user = new User(_.pick(req.body, ['email', 'userName', 'firstName', 'lastName', 'password', 'position']));
  
  user.userScore=1;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  
  await user.save();

  const token = user.generateAuthToken();
  return res.status(200).send({token: token, userName: user.userName});
});

router.post('/createTeacherAccount', [auth, isTeacher],async (req, res) => {

  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  var user = await User.findOne({ userName: req.body.userName });
  if (user) return res.status(400).send('userName already exist.');

  if (req.body.email!="" && req.body.email!=null)
  {
    var user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('email already exist.');
  }
  
  req.body.position="Teacher";
  user = new User(_.pick(req.body, ['email', 'userName', 'firstName', 'lastName', 'password', 'position']));
  
  user.userScore=30;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  
  await user.save();

  const token = user.generateAuthToken();
  return res.status(200).send({token: token, userName: user.userName});
});

router.put('/:id', [auth, isAdminOrTheUser], async (req, res) =>
{
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const salt = await bcrypt.genSalt(10);
  var hashedPassword=await bcrypt.hash(req.body.password, salt);

  const user = await User.findByIdAndUpdate(req.params.id,
    { 
      email: req.body.email,
      userName: req.body.userName,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashedPassword,
      postision: req.body.position
    }, { new: true });
  
  
  if (!user) return res.status(404).send('The user with the given ID was not found.');
  
  res.send(user);
});

router.delete('/:id', [auth, isAdminOrTheUser],async (req, res) =>
{
  const user = await User.findByIdAndRemove(req.params.id);

  if (!user) return res.status(404).send('The user with the given ID was not found.');

  res.send(user);
});

module.exports = router; 
