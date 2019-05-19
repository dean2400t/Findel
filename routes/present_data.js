var express = require('express');
var router = express.Router();
const {Domain} = require('../models/domains');

router.get('/domains', async function(req, res, next) {
   var domains = await Domain.find({}).select('score domainURL _id');
   return res.status(200).send(domains);
});

router.get('/domain_sites', async function(req, res, next) {
   var domain_id = req.query.id;
   var domain_and_sites = await Domain.findById(domain_id)
      .populate('sites', 'siteURL siteFormatedURL')
      .select('score sites domainURL _id');
   return res.status(200).send(domain_and_sites);
});
module.exports = router;