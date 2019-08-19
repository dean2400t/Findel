function topic_selection(opts={})
{ 
    var selection = `
        topicName
        lastGoogleUpdate
        last_wikipidia_search
        number_of_comments
        `
    if (opts['include_edges'])
        selection+=opts['include_edges'];

    return selection
}

function topic_populate(opts={})
{
    var populate= {
        path: 'topic',
        select: topic_selection(opts),
        };
    if (opts['populate'])
        populate.populate = opts['populate'];
    return populate;
}

module.exports.topic_selection=topic_selection;
module.exports.topic_populate=topic_populate;