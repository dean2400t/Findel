const parseDomain = require("parse-domain");
const {Topic} = require('../models/topics');
const {TopicTopicEdge} = require('../models/topic_to_topic_edges');
const {SiteTopicEdge} = require('../models/siteTopicEdges');
const {Domain} = require('../models/domains');
const {Site} = require('../models/sites');

async function topic_save(topic)
{
    try{
        await topic.save()
    }catch(error){ 
        if (error.code == 11000) topic = await Topic.findOne({topicName: topic.topicName});
        else return null;
    }
    return topic;
}

async function site_save(site)
{
    try{
        await site.save()
    }catch(error){ 
        if (error.code == 11000) site = await Site.findOne({siteURL: site.siteURL});
        else return null;
    }
    return site;
}

async function domain_save(domain)
{
    try{
        await domain.save()
    }catch(error){ 
        if (error.code == 11000) 
        {
            domain = await Domain.findOne({domainURL: domain.domainURL});
            return domain;
        }
        else return null;
    }
    return domain;
}

async function add_and_update_domain(new_site)
{
  var site_domainURL = parseDomain(new_site.siteURL);
  if (site_domainURL.subdomain != "")
    site_domainURL = site_domainURL.subdomain + '.' + site_domainURL.domain + '.' + site_domainURL.tld;
  else
    site_domainURL = site_domainURL.domain + '.' + site_domainURL.tld;
  domain = new Domain({domainURL: site_domainURL});
  domain = await domain_save(domain);
  if (!domain)
    console.log("fatal domain adding/update error");
  else
    await Domain.findByIdAndUpdate(domain._id, {$addToSet: {sites: new_site._id}});
  await Site.findByIdAndUpdate(new_site._id, {domain: domain._id});
  new_site.domain = domain._id;
  return new_site;
}

async function site_to_topic_edge_save(edge)
{
    try{
        await edge.save()
    }catch(error){ 
        if (error.code == 11000) edge = await SiteTopicEdge.findOne({site: edge.site, topic: edge.topic});
        else return null;
    }
    return edge;
}

async function topic_to_topic_edge_save(edge)
{
    try{
        await edge.save()
    }catch(error){ 
        if (error.code == 11000) edge = await TopicTopicEdge.findOne({topic1: edge.topic1, topic2: edge.topic2});
        else return null;
    }
    return edge;
}

async function edge_ranking_save(edge_ranking)
{
    try{
        await edge_ranking.save()
    }catch(error){ 
        return false;
    }
    return true;
}

async function topic_to_topic_edges_save(edges)
{
    try{
        res = await TopicTopicEdge.insertMany(edges, {w: 1, ordered: false });
    }catch(error){ 
        return error;
    }
}

async function site_to_topic_edges_save(edges)
{
    try{
        res = await SiteTopicEdge.insertMany(edges, {w: 1, ordered: false });
    }catch(error){ 
        return error;
    }
}

exports.topic_save = topic_save;
exports.topic_to_topic_edges_save=topic_to_topic_edges_save;
exports.site_to_topic_edges_save=site_to_topic_edges_save;
exports.domain_save = domain_save;
exports.site_to_topic_edge_save = site_to_topic_edge_save;
exports.site_save = site_save;
exports.topic_to_topic_edge_save = topic_to_topic_edge_save;
exports.add_and_update_domain = add_and_update_domain;
exports.edge_ranking_save = edge_ranking_save;