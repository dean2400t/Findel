const express = require('express');
const index=require('../routes/index');
const users = require('../routes/users');
const auth = require('../routes/auth');
const authPage=require('../routes/authPage')
const error = require('../middleware/error');

module.exports = function (app){
  app.use(express.json());
  app.use('/',index);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/authPage',authPage);
  app.use(error);
}