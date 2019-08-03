const {Comment} = require('../models/comments');
const {Comments_ranking} = require('../models/comments_rankings');
module.exports=async function extract_comments_from_database(root_comments_IDs_array, userID)
{
    if (root_comments_IDs_array == null)
        return [];
    if (root_comments_IDs_array.lenght == 0)
        return [];

    if (userID == '')
        var comments = await Comment.find({root_comment: {$in: root_comments_IDs_array}}).populate('user');
    else
        var comments = await Comment.find({root_comment: {$in: root_comments_IDs_array}})
        .populate('user')
        .populate({
            path: 'usersRanking',
            match: { user: userID}});
    
    comments.forEach(comment => {
        if (comment.usersRanking == null)
            comment.usersRanking = [];
    });
    return comments;
}