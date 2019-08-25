export default function sort_pages(full_pages_array)
{
    full_pages_array.sort(function(page1, page2){
        if (page2.order_index_by_google===0) return 1;
        if (page1.order_index_by_google===0) return -1;
        if (page2.order_index_by_google==null && page1.order_index_by_google==null) return 0;
        if (page2.order_index_by_google!=null && page1.order_index_by_google==null) return 1;
        if (page2.order_index_by_google==null && page1.order_index_by_google!=null) return -1;
        return page1.order_index_by_google-page2.order_index_by_google;
    });
    full_pages_array.sort(function(page1, page2){
        if (page2.domain.liked_positive_points < 1 && page1.domain.liked_positive_points>=1)
            return -1;
        else if (page2.domain.liked_positive_points >= 1 && page1.domain.liked_positive_points < 1)
            return 1;
        else if (page2.domain.liked_positive_points < 1 && page1.domain.liked_positive_points < 1)
            return page2.domain.liked_positive_points-page1.domain.liked_positive_points;
        else
        return 0;
    });
    full_pages_array.sort(function(page1, page2){return page2.educational_positive_points - page1.educational_positive_points});
    full_pages_array.sort(function(page1, page2){return page2.credibility_positive_points - page1.credibility_positive_points});
    full_pages_array.sort(function(page1, page2){return page2.liked_positive_points - page1.liked_positive_points});
    var temp;
    for (var index=0; index<full_pages_array[index]-1; index+=2)
        if (full_pages_array[index].domain.score < full_pages_array[index+1].domain.score)
        {
            temp=full_pages_array[index];
            full_pages_array[index]=full_pages_array[index+1];
            full_pages_array[index+1]=temp;
        }
    return full_pages_array;
}