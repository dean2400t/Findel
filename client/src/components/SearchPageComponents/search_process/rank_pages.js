import sort_page_to_topic_edges from './sort_page_to_topic_edges';

export default function rank_page_to_topic_edgess(this_of_searchPage)
{   
    var top_page_topic_edges = this_of_searchPage.page_to_topic_edges_from_server_to_use;
    top_page_topic_edges.sort(function(page_to_topic_edge1, page_to_topic_edge2){return page_to_topic_edge2.num_of_links_in_page - page_to_topic_edge1.num_of_links_in_page});
    top_page_topic_edges.sort(function(page_to_topic_edge1, page_to_topic_edge2){return page_to_topic_edge2.jaccard_similarity - page_to_topic_edge1.jaccard_similarity});
    top_page_topic_edges=sort_page_to_topic_edges(top_page_topic_edges);
    var pages_ref=this_of_searchPage.state.pages_ref;
    
    for (var edge_index=0; edge_index<top_page_topic_edges.length; edge_index++)
        if (top_page_topic_edges[edge_index]!=null)
            pages_ref.push(top_page_topic_edges[edge_index]);
    
    var is_more_pages_button_hidden=false;
    if (pages_ref.length>=this_of_searchPage.full_page_to_topic_edges_list_from_server.length)
        is_more_pages_button_hidden=true;
    this_of_searchPage.setState({
        pages_ref: pages_ref,
        pages_in_search: [],
        is_more_pages_button_hidden:is_more_pages_button_hidden
    });
    this_of_searchPage.page_displayed_so_far_index=pages_ref.length-1;
    this_of_searchPage.top_page_topic_edges=top_page_topic_edges;
    this_of_searchPage.ref_pages_for_histoty=pages_ref;
}