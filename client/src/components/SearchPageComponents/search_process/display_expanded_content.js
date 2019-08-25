export default function display_expended_content(this_of_searchPage)
{
    var connected_topics_edges=this_of_searchPage.connected_topics_edges;
    connected_topics_edges.sort(function(edge1, edge2){return edge2.web_scrape_score - edge1.web_scrape_score});
    connected_topics_edges.sort(function(edge1, edge2){return edge2.linkHits - edge1.linkHits});
    connected_topics_edges.sort(function(edge1, edge2){if (edge2.topic.topicName.length<3 && edge1.topic.topicName.length>=3) return -1;});
    connected_topics_edges.sort(function(edge1, edge2){return edge2.liked_positive_points - edge1.liked_positive_points});
    
    var expandedCon=[];
    for (var content=0; content<connected_topics_edges.length && content<10; content++)
    {
        var partition=" | ";
        expandedCon.push({id: this_of_searchPage.id, 
            page: connected_topics_edges[content].topic.topicName, 
            partition: partition
            });
        this_of_searchPage.id++;
    }
    this_of_searchPage.setState({
        expandedContents: expandedCon,
        is_show_more_content_hidden: true,
        expandend_content_status: ""
    });
    this_of_searchPage.expandedCon_to_history=expandedCon;
    this_of_searchPage.save_to_history();
}