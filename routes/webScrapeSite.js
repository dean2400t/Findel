const {Site, validateSite} = require('../models/sites');
const webScrapeURL=require('../middleware/webScrape');

var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
    var url=req.query.urlToScrape;
    var siteInDB=await Site.findOne({siteURL:url});
    if (siteInDB)
    {
        if (siteInDB.lastScrape!=null && siteInDB.html!=null)
        {
            var lastScrapeAge=new Date() - siteInDB.lastScrape;
            var numOfDaysToLive=2;
            if (lastScrapeAge <= numOfDaysToLive*86400000)
                return res.status(200).send(siteInDB.html);
        }
        var text=await webScrapeURL(url);
        if (text!="")
        {
            await Site.findOneAndUpdate({_id:siteInDB._id}, {lastScrape:new Date(), html: text});
            return res.status(200).send(text);
        }
        else
            return res.status(404).send("Page can't be scraped");
    }
    else
    {
        var text=await webScrapeURL(url);
        if (text!="")
        {
        siteInDB=new Site({siteURL: url});
        siteInDB.lastScrape=new Date();
        siteInDB.html=text;
        await siteInDB.save();
        return res.status(200).send(text);
        }
    }
    return res.status(404).send("Page can't be scraped");
});
module.exports = router;