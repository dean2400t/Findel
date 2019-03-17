const express = require('express');
const index=require('../routes/pages/index');
const users = require('../routes/users');
const auth = require('../routes/auth');
const authPage=require('../routes/pages/authPage');
const addAdminPage=require('../routes/pages/addAdminPage');
const error = require('../middleware/error');
var cors = require('cors')

module.exports = function (app){
  app.use(cors());
  app.use(express.json());
  app.use('/',index);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/authPage',authPage);
  app.use('/addAdmin',addAdminPage);
  app.use(error);
}