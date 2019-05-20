const parseDomain = require("parse-domain");

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res) {
    var dom = parseDomain("sdadsa.com");
    return res.status(200).send("OK");
});
module.exports = router;