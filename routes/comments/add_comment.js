const get_collection_from_collection_name = require('../../models/common_functions_for_collections/get_collection_from_collection_name');
const {User} = require('../../models/users');
const {Comment} = require('../../models/comments');
const {comment_save} = require('../../models/common_functions_for_collections/save_securely_to_database');
module.exports=async function add_comment(text, object_id, object_collection_name, root_comment_id, userID, res)
{
    var user=await User.findById(userID)
    .select('_id')
    .lean();
    if (!user)
        return res.status(400).send("User not found in database");

    var collection = await get_collection_from_collection_name(object_collection_name);
    if (!collection)
        return res.status(400).send("collection name is incorrect");

    var object_to_comment = await collection.findById(object_id)
    .select('_id')
    .lean();
    if (!object_to_comment)
        return res.status(400).send("Object with this ID does not exist in this collection");

    //inserting comment to root of object commented
    if (!root_comment_id)
    {
        var comment = new Comment({
            text: text,
            object_id: object_id,
            object_collection_name: object_collection_name,
            user: user._id
        });
        comment.root_comment=comment._id;
        if (await comment_save(comment))
        {
            await collection.findOneAndUpdate({_id: object_id}, 
                {
                    $inc: {number_of_comments: 1}
                });
            await User.findOneAndUpdate({_id: user._id}, 
                {
                    $inc: {number_of_comments: 1}
                });
            return res.status(200).send(comment);
        }
    }
    //entering comment under parent comment
    else
    {
        var root_comment = await Comment.findById(root_comment_id)
        if (!root_comment)
            return res.status(400).send("Root comment not found in database");
        
        var comment = new Comment({
            text: text,
            object_id: object_id,
            object_collection_name: object_collection_name,
            user: user._id,
            root_comment: root_comment_id
        });
        
        if (await comment_save(comment))
        {
            await User.findOneAndUpdate({_id: user._id}, 
                {
                    $inc: {number_of_comments: 1}
                });

            collection=  await get_collection_from_collection_name(root_comment.object_collection_name)
            await collection.findOneAndUpdate({_id: root_comment.object_id}, 
                {$inc: {number_of_comments: 1}}
            );
            return res.status(200).send(comment);
        }
    }
    return res.status(500).send("comment not saved");
}
