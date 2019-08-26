export default function sort_page_to_topic_edges(full_page_topic_edges_array)
{
    full_page_topic_edges_array.sort(function(page_topic_edge1, page_topic_edge2){
        if (page_topic_edge2.order_index_by_google===0) return 1;
        if (page_topic_edge1.order_index_by_google===0) return -1;
        if (page_topic_edge2.order_index_by_google==null && page_topic_edge1.order_index_by_google==null) return 0;
        if (page_topic_edge2.order_index_by_google!=null && page_topic_edge1.order_index_by_google==null) return 1;
        if (page_topic_edge2.order_index_by_google==null && page_topic_edge1.order_index_by_google!=null) return -1;
        return page_topic_edge1.order_index_by_google-page_topic_edge2.order_index_by_google;
    });
    full_page_topic_edges_array.sort(function(page_topic_edge1, page_topic_edge2){
        if (page_topic_edge2.page.domain.liked_positive_points < 1 && page_topic_edge1.page.domain.liked_positive_points>=1)
            return -1;
        else if (page_topic_edge2.page.domain.liked_positive_points >= 1 && page_topic_edge1.page.domain.liked_positive_points < 1)
            return 1;
        else if (page_topic_edge2.page.domain.liked_positive_points < 1 && page_topic_edge1.page.domain.liked_positive_points < 1)
            return page_topic_edge2.page.domain.liked_positive_points-page_topic_edge1.page.domain.liked_positive_points;
        else
        return 0;
    });
    full_page_topic_edges_array.sort(function(page_topic_edge1, page_topic_edge2){
        return page_topic_edge2.page.educational_positive_points - page_topic_edge1.page.educational_positive_points
    });
    full_page_topic_edges_array.sort(function(page_topic_edge1, page_topic_edge2){
        return page_topic_edge2.page.credibility_positive_points - page_topic_edge1.page.credibility_positive_points
    });
    full_page_topic_edges_array.sort(function(page_topic_edge1, page_topic_edge2){
        return page_topic_edge2.liked_positive_points - page_topic_edge1.liked_positive_points
    });
    var temp;
    for (var index=0; index<full_page_topic_edges_array[index]-1; index+=2)
        if (full_page_topic_edges_array[index].page.domain.liked_positive_points < full_page_topic_edges_array[index+1].page.domain.liked_positive_points)
        {
            temp=full_page_topic_edges_array[index];
            full_page_topic_edges_array[index]=full_page_topic_edges_array[index+1];
            full_page_topic_edges_array[index+1]=temp;
        }
    return full_page_topic_edges_array;
}