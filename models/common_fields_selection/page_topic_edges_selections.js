const {usersRanking_populate} = require('./ranking_selections');

function page_topic_edges_selection(opts={})
{ 
    var selection = `
        page
        topic
        added_by
        order_index_by_google
        lastCalculated
        num_of_links_in_page
        jaccard_similarity
        liked_positive_points
        liked_negative_points
        number_of_comments
        `
    if (opts['userID'] != null)
        selection+=`
        usersRanking
        `
    
    return selection;
}

function page_topic_edges_populate(opts={})
{
    var populate = {
        path: 'page_topic_edges',
        select: page_topic_edges_selection(opts),
        }
    if (opts['populate'])
        populate.populate = opts['populate'];
    if (opts['userID'])
    {
        if (populate.populate == null)
            populate.populate = [];
        populate.populate.push(usersRanking_populate({userID: opts['userID']}));
    }
    return populate;
}

module.exports.page_topic_edges_selection=page_topic_edges_selection;
module.exports.page_topic_edges_populate=page_topic_edges_populate;
