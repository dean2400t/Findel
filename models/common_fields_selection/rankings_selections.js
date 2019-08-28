function rankings_selection(opts={})
{ 
    var selection = `
        rank_type
        rank_code
        `
    if (opts['include_edges']!=null)
        selection+= opts['include_edges'];
    
    return selection;
}

function rankings_populate(opts={})
{
    if (opts['userID'] != null)
    {
        var populate = {
            path: 'rankings',
            select: rankings_selection(),
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


module.exports.rankings_selection = rankings_selection;
module.exports.rankings_populate = rankings_populate;

