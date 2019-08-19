const {usersRanking_populate} = require('./ranking_selections');

function comment_selection(opts={})
{ 
    var selection = `
        object_id
        object_id_collection_name
        user
        text
        liked_positive_points
        liked_negative_points
        root_comment
        `
    if (opts['userID'] != null)
        selection+=`
        usersRanking
        `
    
    return selection;
}

module.exports.comment_selection=comment_selection;
