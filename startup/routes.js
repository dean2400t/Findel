const express = require('express');
const index=require('../routes/pages/index');
const users = require('../routes/users');
const auth = require('../routes/auth');
const authPage=require('../routes/pages/authPage');
const addAdminPage=require('../routes/pages/addAdminPage');
const topicsSitesData=require('../routes/topics_to_sites_data');
const topicsTopicsData=require('../routes/topics_to_topics_data');
const users_content_addind=require('../routes/users_content_adding');
const webScrapeSite=require('../routes/webScrapeSite');
const userRankInput=require('../routes/userRankInput');
const user_data=require('../routes/user_data');
const error = require('../middleware/error');
var cors = require('cors')

module.exports = function (app){
  app.use(cors());
  app.use(express.json());
  app.use('/',index);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/topicsToSitesData', topicsSitesData);
  app.use('/api/topicsToTopicsData', topicsTopicsData);
  app.use('/api/addContent', users_content_addind);
  app.use('/api/webScrape', webScrapeSite);
  app.use('/addAdmin',addAdminPage);
  app.use('/authPage',authPage);
  app.use('/addAdmin',addAdminPage);
  app.use('/api/userRanking', userRankInput);
  app.use('/api/userData', user_data);
  app.use(error);
}