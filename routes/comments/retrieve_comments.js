const {Comment} = require('../../models/comments');
const {comment_selection} = require('../../models/common_fields_selection/comment_selections');
const {rankings_populate} = require('../../models/common_fields_selection/rankings_selections');

async function extract_comments_from_database(root_comments_IDs_array, userID)
{
    if (root_comments_IDs_array == null)
        return [];
    if (root_comments_IDs_array.lenght == 0)
        return [];

    var comments = await Comment.find({root_comment: {$in: root_comments_IDs_array}})
    .select(comment_selection({userID: userID}))
    .populate('user', 'userName position')
    .populate(rankings_populate(
        {
            userID: userID,
            object_collection_name: 'comments'
        }))
    .lean();

    comments.forEach(comment => {
        comment.time_made= comment._id.getTimestamp();
    });
    return comments;
}

module.exports= async function retrieve_comments(object_id, object_id_collection_name, userID, res)
{
    var root_comments  = await Comment.find({
        object_id: object_id,
        object_id_collection_name: object_id_collection_name
    })
    .select(
        '_id'
    ).lean();
   
    if (root_comments.length>0)
        return res.status(200).send(await extract_comments_from_database(root_comments, userID));
   return res.status(200).send([]);
}