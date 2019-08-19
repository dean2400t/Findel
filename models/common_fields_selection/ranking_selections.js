function rankings_selection()
{ 
    return `
        rank_type
        rankCode
        `
}

function usersRanking_populate(opts={})
{
    var populate = {
        path: 'usersRanking',
        select: rankings_selection()
        }
    if (opts['userID'] != null)
        populate.match= {user: opts['userID']}
    return populate;
}

function edges_usersRanking_populate(opts={})
{
    var populate = {
        path: 'edges_usersRanking',
        select: rankings_selection()
        }
    if (opts['userID'] != null)
        populate.match= {user: opts['userID']}
    return populate;
}

function page_usersRanking_populate(opts={})
{
    var populate = {
        path: 'page_usersRanking',
        select: rankings_selection()
        }
    if (opts['userID'] != null)
        populate.match= {user: opts['userID']}
    return populate;
}

function edges_to_pages_usersRanking_populate(opts={})
{
    var populate = {
        path: 'edges_to_pages_usersRanking',
        select: rankings_selection()
        }
    if (opts['userID'] != null)
        populate.match= {user: opts['userID']}
    return populate;
}


module.exports.rankings_selection = rankings_selection;
module.exports.usersRanking_populate = usersRanking_populate;
module.exports.edges_usersRanking_populate = edges_usersRanking_populate;
module.exports.page_usersRanking_populate = page_usersRanking_populate;
module.exports.edges_to_pages_usersRanking_populate = edges_to_pages_usersRanking_populate;
