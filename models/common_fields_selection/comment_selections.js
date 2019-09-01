function comment_selection(opts={})
{ 
    var selection = `
        object_id
        object_collection_name
        user
        text
        liked_positive_points
        liked_negative_points
        root_comment
        number_of_comments
        `
    if (opts['userID'] != null)
        selection+=`
        rankings
        `
    
    return selection;
}

module.exports.comment_selection=comment_selection;
