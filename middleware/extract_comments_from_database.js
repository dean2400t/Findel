const {Comment} = require('../models/comments');
module.exports=async function extract_comments_from_database(root_comments_IDs_array, userID)
{
    if (root_comments_IDs_array == null)
        return [];
    if (root_comments_IDs_array.lenght == 0)
        return [];

    if (userID == '')
        return await Comment.find({root_comment: {$in: root_comments_IDs_array}});
    else
        return await Comment.find({root_comment: {$in: root_comments_IDs_array}})
        .populate({
            path: 'usersRanking',
            match: { user: userID}});
}