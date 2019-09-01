const {rankings_populate} = require('./rankings_selections');

function topic_topic_edges_selection(opts={})
{ 
    var selection = `
        topic1
        topic2
        added_by
        web_scrape_score
        liked_positive_points
        liked_negative_points
        number_of_comments
        last_web_scrape
        `
    if (opts['userID'] != null)
        selection+=`
        rankings
        `
    
    return selection;
}

function topic_topic_edges_populate(opts={})
{
    var populate = {
        path: 'topic_topic_edges',
        select: topic_topic_edges_selection(opts),
        }
    if (opts['populate'])
        populate.populate = opts['populate'];
    if (opts['userID'])
    {
        if (populate.populate == null)
            populate.populate = [];
        populate.populate.push(rankings_populate({ 
            userID: opts['userID'],
            object_collection_name: 'topic-topic-edges'
    }));
    }
    return populate;
}

module.exports.topic_topic_edges_selection=topic_topic_edges_selection;
module.exports.topic_topic_edges_populate=topic_topic_edges_populate;
