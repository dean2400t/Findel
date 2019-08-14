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

    comments["root"].sort((comment1, comment2)=>{
        return comment2.likedֹ_positive_points - comment1.likedֹ_positive_points;
    });
    comments_array.forEach(comment => {
        comment.sub_comments.sort((sub_comment1, sub_comment2)=>{
            return sub_comment2.likedֹ_positive_points - sub_comment1.likedֹ_positive_points;
        });
    });
    return comments["root"];
}