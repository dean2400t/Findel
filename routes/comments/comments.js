var express = require('express');
var router = express.Router();

router.get('/retrieve_comments',async function(req, res) {
    var object_id = req.query.object_id;
    var object_id_collection_name = req.query.object_id_collection_name;
    if (!object_id)
        return res.status(400).send('No object_id was sent')
    if (!object_id_collection_name)
        return res.status(400).send('No object_id_collection_name was sent')
    var token=req.headers['findel-auth-token'];
    var userID= checkAuthAndReturnUserID(token);
    return retrieve_comments(object_id, object_id_collection_name, userID, res);
 });
 
 module.exports = router;