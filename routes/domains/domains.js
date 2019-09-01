var express = require('express');
var router = express.Router();

const {Domain}= require('../../models/domains');

const {domain_selection}= require('../../models/common_fields_selection/domain_selections');

const {page_selection}= require('../../models/common_fields_selection/page_selections');

const help = require('./help');

router.get('/help', function(req, res) {
    return res.status(200).send(help());
  });

router.get('/request_domains', async function(req, res) {
    var domains = await Domain.find({})
    .select(domain_selection())
    .lean();
    return res.status(200).send(domains);
 });

router.get('/domain_pages', async function(req, res) {
    var domain_id = req.query.id;
    var domain_and_pages = await Domain.findById(domain_id)
    .select(domain_selection({include_edges: 'pages'}))
    .populate({
      path: 'pages',
      select: page_selection(),
    })
    .lean();
    return res.status(200).send(domain_and_pages);
 });

 module.exports = router;