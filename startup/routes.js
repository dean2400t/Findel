const express = require('express');
const users = require('../routes/users');
const auth = require('../routes/auth');
const topics_to_pages_data=require('../routes/topics_to_pages_data');
const topics_to_topics_data=require('../routes/topics_to_topics_data');
const users_content_addind=require('../routes/users_content_adding');
const web_scrape_page=require('../routes/web_scrape_page');
const userRankInput=require('../routes/userRankInput');
const user_insert_data=require('../routes/user_insert_data');
const publicComponents = require('../routes/publicComponents');
const present_data=require('../routes/present_data');
const tests = require('../routes/tests');
const user_data=require('../routes/user_data');
const error = require('../middleware/error');
var cors = require('cors')

module.exports = function (app){
  app.use(cors());
  app.use(express.json());
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/topics_to_pages_data', topics_to_pages_data);
  app.use('/api/topics_to_topics_data', topics_to_topics_data);
  app.use('/api/addContent', users_content_addind);
  app.use('/api/webScrape', web_scrape_page);
  app.use('/publicComponents', publicComponents);
  app.use('/api/userRanking', userRankInput);
  app.use('/api/userData', user_data);
  app.use('/api/userInsertData', user_insert_data);
  app.use('/api/present_data', present_data);
  app.use('/tests', tests);
  app.use(error);
}