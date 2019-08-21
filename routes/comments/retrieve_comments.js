const {Comment} = require('../../models/comments');
const {comment_selection} = require('../../models/common_fields_selection/comments_selections');
const {usersRanking_populate} = require('../../models/common_fields_selection/ranking_selections');

var dateFromObjectId = function (objectId) {
    var date= new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
    var dateFormated=new Intl.DateTimeFormat('he-IL', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(date);
    return dateFormated;
};

async function extract_comments_from_database(root_comments_IDs_array, userID)
{
    if (root_comments_IDs_array == null)
        return [];
    if (root_comments_IDs_array.lenght == 0)
        return [];

    var comments = await Comment.find({root_comment: {$in: root_comments_IDs_array}})
    .select(comment_selection({userID: userID}))
    .populate('user', 'userName position')
    .populate(usersRanking_populate({userID: userID}))
    .lean();

    comments.forEach(comment => {
        if (comment.usersRanking == null)
            comment.usersRanking = [];
        comment.time_made= dateFromObjectId(comment.id);
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
        return res.status(200).send(extract_comments_from_database(root_comments));
   return res.status(200).send([]);
}