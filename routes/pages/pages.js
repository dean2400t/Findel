var express = require('express');
var router = express.Router();
const auth = require('../../middleware/security/auth');

const checkAuthAndReturnUserID=require('../../middleware/checkAuthAndReturnUserID');

const help = require('./help');

const retrieve_page_data= require('./retrieve_page_data');
const rank_page=  require('./rank_page');

router.get('/help', function(req, res) {
  return res.status(200).send(help());
});

router.get('/page_data',async function(req, res) {
    var encoded_pageURL = req.query.encoded_pageURL;
    
    if (!encoded_pageURL)
       return res.status(400).send("No encoded_pageURL was sent")
    
    try {
      var pageURL=decodeURI(encoded_pageURL);
    } catch (error) {
      return res.status(400).send("faild to decode url");
    }
    
    var token=req.headers['findel-auth-token'];
    var userID= checkAuthAndReturnUserID(token);
    return await retrieve_page_data(pageURL, userID, res);
 });

 
router.post('/rank_page', auth, async function(req, res) {

    var pageID=req.body.pageID;
    var rank_type = req.body.rank_type;
    var rank_code=req.body.rank_code;
    if (!pageID)
      return res.status(400).send("No pageID was sent");
    if (!rank_type)
      return res.status(400).send("No rank_type was sent");
    if (rank_type != "credibility" &&
      rank_type != "educational")
      return res.status(400).send("this rank_type is not accepted for direct ranking");
    if (!rank_code && rank_code!==0)
      return res.status(400).send("No rank_code was sent");
    if (rank_code<0 || rank_code>2)
      return res.status(400).send("rank_code must be 0, 1, or 2");
    if (!Number.isInteger(rank_code))
    return res.status(400).send("rank_code must be 0, 1, or 2");
    
    return await rank_page(pageID, rank_type, rank_code, req.user._id, res)
  });
  

module.exports = router;