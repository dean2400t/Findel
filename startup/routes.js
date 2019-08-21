const express = require('express');
const users = require('../routes/users');
const auth = require('../routes/auth');
const pages_to_topics=require('../routes/pages_to_topics');
const topics_to_topics=require('../routes/topics_to_topics');
const users_content_addind=require('../routes/users_content_adding');
const web_scrape_page=require('../routes/web_scrape_page');
const userRankInput=require('../routes/userRankInput');
const user_insert_data=require('../routes/user_insert_data');
const comments= require('../routes/comments/comments')
const publicComponents = require('../routes/publicComponents');
const present_data=require('../routes/present_data/present_data');
const tests = require('../routes/tests');
const user_data=require('../routes/user_data');
const error = require('../middleware/error');
var cors = require('cors')

module.exports = function (app){
  app.use(cors());
  app.use(express.json());
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/pages_to_topics', pages_to_topics);
  app.use('/api/topics_to_topics', topics_to_topics);
  app.use('/api/addContent', users_content_addind);
  app.use('/api/webScrape', web_scrape_page);
  app.use('/publicComponents', publicComponents);
  app.use('/api/userRanking', userRankInput);
  app.use('/api/userData', user_data);
  app.use('/api/userInsertData', user_insert_data);
  app.use('/api/comments', comments);
  app.use('/api/present_data', present_data);
  app.use('/tests', tests);
  app.use(error);
}