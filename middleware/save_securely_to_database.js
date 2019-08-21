const parseDomain = require("parse-domain");
const {Topic} = require('../models/topics');
const {Topic_topic_edge} = require('../models/topic_to_topic_edges');
const {Page_topic_edge} = require('../models/page_topic_edges');
const {Domain} = require('../models/domains');
const {Page} = require('../models/pages');

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

async function page_save(page)
{
    try{
        await page.save()
    }catch(error){ 
        if (error.code == 11000) page = await Page.findOne({pageURL: page.pageURL});
        else return null;
    }
    return page;
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

async function add_and_update_domain(new_page)
{
  var page_domainURL = parseDomain(new_page.pageURL);
  if (page_domainURL.subdomain != "")
    page_domainURL = page_domainURL.subdomain + '.' + page_domainURL.domain + '.' + page_domainURL.tld;
  else
    page_domainURL = page_domainURL.domain + '.' + page_domainURL.tld;
  domain = new Domain({domainURL: page_domainURL});
  domain = await domain_save(domain);
  if (!domain)
    console.log("fatal domain adding/update error");
  else
    await Domain.findByIdAndUpdate(domain._id, {$addToSet: {pages: new_page._id}});
  await Page.findByIdAndUpdate(new_page._id, {domain: domain._id});
  new_page.domain = domain._id;
  return new_page;
}

async function page_to_topic_edge_save(edge)
{
    try{
        await edge.save()
    }catch(error){ 
        if (error.code == 11000) edge = await Page_topic_edge.findOne({page: edge.page, topic: edge.topic});
        else return null;
    }
    return edge;
}

async function topic_to_topic_edge_save(edge)
{
    if (edge.topic1.equals(edge.topic2))
        return null;
    try{
        await edge.save()
    }catch(error){ 
        if (error.code == 11000) edge = await Topic_topic_edge.findOne({topic1: edge.topic1, topic2: edge.topic2});
        else return null;
    }
    return edge;
}

async function ranking_save(ranking)
{
    try{
        await ranking.save()
    }catch(error){ 
        return false;
    }
    return true;
}

async function comment_save(comment)
{
    try{
        await comment.save()
    }catch(error){ 
        return false;
    }
    return true;
}

async function comment_ranking_save(comment_ranking)
{
    try{
        await comment_ranking.save()
    }catch(error){ 
        return false;
    }
    return true;
}

async function topic_to_topic_edges_save(edges)
{
    try{
        res = await Topic_topic_edge.insertMany(edges, {w: 1, ordered: false });
    }catch(error){ 
        return error;
    }
}

async function page_to_topic_edges_save(edges)
{
    try{
        res = await Page_topic_edge.insertMany(edges, {w: 1, ordered: false });
    }catch(error){ 
        return error;
    }
}

exports.topic_save = topic_save;
exports.topic_to_topic_edges_save=topic_to_topic_edges_save;
exports.page_to_topic_edges_save=page_to_topic_edges_save;
exports.domain_save = domain_save;
exports.page_to_topic_edge_save = page_to_topic_edge_save;
exports.page_save = page_save;
exports.topic_to_topic_edge_save = topic_to_topic_edge_save;
exports.add_and_update_domain = add_and_update_domain;
exports.ranking_save = ranking_save;
exports.comment_save = comment_save;
exports.comment_ranking_save = comment_ranking_save;