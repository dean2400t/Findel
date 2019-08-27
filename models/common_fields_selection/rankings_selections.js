function rankings_selection()
{ 
    return `
        rank_type
        rank_code
        `
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

