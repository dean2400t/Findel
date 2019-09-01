var express = require('express');
var router = express.Router();
const auth = require('../../middleware/security/auth');

const search_history= require('./search_history');
const favorites= require('./favorites');

router.get('/search_history', auth, async function(req, res) {
  var userID= req.user._id;
  return await search_history(userID, res);
});

router.get('/favorites', auth, async function(req, res) {
  var userID= req.user._id;
  return await favorites(userID, res);
});
module.exports = router;