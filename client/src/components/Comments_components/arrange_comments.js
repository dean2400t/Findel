export default function arrange_comments(comments_array){
    var comments = {};
    comments["root"]=[];
    comments_array.forEach(comment => {
        comments[comment._id] = [];
        comment.sub_comments = comments[comment._id];
        comment.id = comment._id;
        if (comment.object_id_collection_name!="comments")
            comments["root"].push(comment);
    });

    comments_array.forEach(comment => {
        if (comment.object_id_collection_name=="comments")
            comments[comment.object_id].push(comment);
    });
    return comments["root"];
}