var express = require('express');
var router = express.Router();
const auth = require('../../middleware/security/auth');
const checkAuthAndReturnUserID= require('../../middleware/checkAuthAndReturnUserID');

const retrieve_comments= require('./retrieve_comments');
const add_comment= require('./add_comment');
const rank_comment= require('./rank_comment');

router.get('/retrieve_comments',async function(req, res) {
    var object_id = req.query.object_id;
    var object_id_collection_name = req.query.object_id_collection_name;
    if (!object_id)
        return res.status(400).send('No object_id was sent')
    if (!object_id_collection_name)
        return res.status(400).send('No object_id_collection_name was sent')
    var token=req.headers['findel-auth-token'];
    var userID= checkAuthAndReturnUserID(token);
    return await retrieve_comments(object_id, object_id_collection_name, userID, res);
 });
 
router.post('/add_comment', auth, async function(req, res) {
  
    var text=req.body.text;
    var object_id = req.body.object_id;
    var object_id_collection_name = req.body.object_id_collection_name;
    var root_comment_id = req.body.root_comment_id;
    if (!text)
        return res.status(400).send("אין טקסט בגוף הבקשה");
    if (object_id=="")
        return res.status(400).send("אין ID של אובייקט בגוף הבקשה");
    if (!object_id_collection_name)
        return res.status(400).send("אין לאיזה ספריית אובייקטים לשמור בגוף הבקשה");

    return await add_comment(text, object_id, object_id_collection_name, root_comment_id, req.user._id, res)
});
 
router.post('/rank_comment', auth, async function(req, res) {
  
    var commentID=req.body.commentID;
    var rank_type = req.body.rank_type;
    var rank_code=req.body.rank_code;
    if (!commentID)
        return res.status(400).send("No commentID was sent");
    if (!rank_type)
        return res.status(400).send("No rank_type was sent");
    if (!rank_code && rank_code!==0)
        return res.status(400).send("No rank_code was sent");
    if (rank_code<0 || rank_code>2)
        return res.status(400).send("rank_code must be 0, 1, or 2");
    if (!Number.isInteger(rank_code))
        return res.status(400).send("rank_code must be 0, 1, or 2");

    return await rank_comment(commentID, rank_type, rank_code, req.user._id, res);
});


 module.exports = router;