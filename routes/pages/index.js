var wtf = require('wtf_wikipedia');
const {google} = require('googleapis');
var express = require('express');
//const extractDataFromRefLink=require('../../middleware/basicSearch/searchFunctions');
const rabinKarpSearch=require('../../middleware/rabinKarpSearch');
const getTextFromURL=require('../../middleware/webScrape');
var router = express.Router();

function function2() {
  // all the stuff you want to happen after that pause
  console.log('Blah blah blah blah extra-blah');
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index');
});
module.exports = router;