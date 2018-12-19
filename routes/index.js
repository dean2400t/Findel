const auth = require('../middleware/auth');
const admin=require('../middleware/admin');
var express = require('express');
var router = express.Router();




/* GET home page. */
router.get('/', [auth, admin], function(req, res, next) {
  res.render('index', { title: 'ניהול חלוקות: פרחי ליידי דיאן' });
});

module.exports = router;
