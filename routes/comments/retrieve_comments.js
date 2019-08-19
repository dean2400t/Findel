const {Comment} = require('../../models/comments');
const {comment_selection} = require('../../models/common_fields_selection/comments_selections');

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

    if (userID == '')
        var comments = await Comment.find({root_comment: {$in: root_comments_IDs_array}}).populate('user');
    else
        var comments = await Comment.find({root_comment: {$in: root_comments_IDs_array}})
        .populate('user', 'userName position')
        .populate({
            path: 'usersRanking',
            match: { user: userID}});
    
    var comments_data_to_return = [];
    comments.forEach(comment => {
        if (comment.usersRanking == null)
            comment.usersRanking = [];
        var user_data={
            userName: comment.user.userName,
            position: comment.user.position
        }

        var usersRanking_to_return=[];
        comment.usersRanking.forEach(ranking => {
            usersRanking_to_return.push({
                _id: ranking._id,
                id: ranking.id,
                rank_type: ranking.rank_type,
                rankCode: ranking.rankCode
                });
        });
        comments_data_to_return.push({
            _id: comment._id,
            id: comment.id,
            object_id: comment.object_id,
            object_id_collection_name: comment.object_id_collection_name,
            user: user_data,
            usersRanking: usersRanking_to_return,
            text: comment.text,
            liked_positive_points: comment.liked_positive_points,
            liked_negative_points: comment.liked_negative_points,
            root_comment: comment.root_comment,
            time_made: dateFromObjectId(comment.id)
        })
    });
    return comments_data_to_return;
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
    {
        extract_comments_from_database(root_comments)
    }
   return res.status(200).send(page);
}