function domain_selection(opts={}){

    var selection = `
        domainURL
        liked_positive_points
        liked_negative_points
        credibility_positive_points
        credibility_negative_points
        educational_positive_points
        educational_negative_points
        number_of_comments
        `
    if (opts['include_edges'])
        selection+=opts['include_edges'];
    
    if (opts['userID'] != null)
        selection += `rankings`
        
    return selection;
}

function domain_populate(opts={})
{
    var populate = {
        path: 'domain',
        select: domain_selection(opts),
        }
    if (opts['populate'])
        populate.populate = opts['populate'];
    /*
    if (opts['userID'])
    {
        if (populate.populate == null)
            populate.populate = [];
    }
    */
    return populate;
}


module.exports.domain_selection=domain_selection;
module.exports.domain_populate=domain_populate;