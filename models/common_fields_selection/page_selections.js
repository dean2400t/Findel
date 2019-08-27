const {rankings_populate} = require('./rankings_selections');

function page_selection(opts={})
{ 
    var selection = `
        pageURL
        pageSnap
        domain
        liked_positive_points
        liked_negative_points
        credibility_positive_points
        credibility_negative_points
        educational_positive_points
        educational_negative_points
        `
    if (opts['include_edges'])
        selection+=opts['include_edges'];
        
    if (opts['userID'] != null)
        selection += `rankings`
    return selection;
}

function page_populate(opts={})
{
    var populate = {
        path: 'page',
        select: page_selection(opts),
        }
    if (opts['populate'])
        populate.populate = opts['populate'];
    if (opts['userID'])
    {
        if (populate.populate == null)
            populate.populate = [];
        populate.populate.push(rankings_populate(
            {
                userID: opts['userID'],
                object_collection_name: 'pages'
            }));
    }
    return populate;
}

module.exports.page_selection=page_selection;
module.exports.page_populate=page_populate;
