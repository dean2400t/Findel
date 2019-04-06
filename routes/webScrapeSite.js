const {Site, validateSite} = require('../models/sites');
const webScrapeURL=require('../middleware/webScrape');

var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
    var text=await webScrapeURL(req.query.urlToScrape);
    if (text!="")
        return res.status(200).send(text);
    else
        return res.status(404).send("Page can't be scraped");
});
module.exports = router;