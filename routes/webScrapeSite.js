const {Site, validateSite} = require('../models/sites');
const webScrapeURL=require('../middleware/webScrape');

var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
    var url=req.query.urlToScrape;
    var force_scrape=req.query.force_scrape;
    var uri = encodeURI(url);
    var siteInDB=await Site.findOne({siteURL:uri});
    if (siteInDB)
    {
        if (siteInDB.lastScrape!=null && force_scrape==false)
        {
            var lastScrapeAge=new Date() - siteInDB.lastScrape;
            var numOfDaysToLive=2;
            if (lastScrapeAge <= numOfDaysToLive*86400000)
                return res.status(200).send(siteInDB);
        }
        var text=await webScrapeURL(uri);
        if (text!="")
        {
            siteInDB.lastScrape=new Date();
            siteInDB.html=text;
            await Site.findOneAndUpdate({_id:siteInDB._id}, {lastScrape:new Date(), html: text});
            return res.status(200).send({site: siteInDB, siteText: text});
        }
        else
            return res.status(404).send("Page can't be scraped");
    }
    else
    {
        var text=await webScrapeURL(uri);
        if (text!="")
        {
            siteInDB=new Site({siteURL: uri, siteFormatedURL: url});
            await siteInDB.save();
            return res.status(200).send({site: siteInDB, siteText: text});
        }
    }
    return res.status(404).send("Page can't be scraped");
});
module.exports = router;