const express = require('express');
const users = require('../routes/users');
const auth = require('../routes/auth');
const pages= require('../routes/pages/pages');
const domains= require('../routes/domains/domains');
const page_topic_edges=require('../routes/page_topic_edges/page_topic_edges');
const topic_topic_edges=require('../routes/topic_topic_edges/topic_topic_edges');
const comments= require('../routes/comments/comments')
const publicComponents = require('../routes/publicComponents');
const tests = require('../routes/tests');
const user_data=require('../routes/user_data/user_data');
const error = require('../middleware/error');
var cors = require('cors')

module.exports = function (app){
  app.use(cors());
  app.use(express.json());
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/pages', pages);
  app.use('/api/domains', domains);
  app.use('/api/page_topic_edges', page_topic_edges);
  app.use('/api/topic_topic_edges', topic_topic_edges);
  app.use('/publicComponents', publicComponents);
  app.use('/api/user_data', user_data);
  app.use('/api/comments', comments);
  app.use('/tests', tests);
  app.use(error);
}