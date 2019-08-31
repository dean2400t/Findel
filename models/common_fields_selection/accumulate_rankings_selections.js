function accumulate_rankings_selection(opts={})
{ 
    var selection = `
        rank_type
        positive_rankings
        negative_rankings
        user_score
        __v
        `
    if (opts['include_edges']!=null)
        selection+= opts['include_edges'];
    
    return selection;
}

function accumulate_rankings_populate(opts={})
{
    if (opts['userID'] != null)
    {
        var populate = {
            path: 'rankings',
            select: accumulate_rankings_selection(),
            match: {
                user: opts['userID'],
                object_collection_name: opts['object_collection_name']
                }
            }
    }
    else 
        var populate=[];
    return populate;
}


module.exports.accumulate_rankings_selection = accumulate_rankings_selection;
module.exports.accumulate_rankings_populate = accumulate_rankings_populate;

