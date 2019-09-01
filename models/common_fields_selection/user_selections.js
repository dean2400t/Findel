function user_selection(opts={})
{ 
    var selection = `
        email
        userName
        firstName
        lastName
        position
        `
    if (opts['include_edges'])
        selection+=opts['include_edges'];

    return selection;
}

function user_populate(opts={})
{
    var populate = {
        path: 'users',
        select: user_selection(opts),
        }
    if (opts['populate'])
        populate.populate = opts['populate'];
    return populate;
}

module.exports.user_selection=user_selection;
module.exports.user_populate=user_populate;
