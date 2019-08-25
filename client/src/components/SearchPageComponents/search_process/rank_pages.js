import sort_pages from './sort_pages';

export default function rank_pages(this_of_searchPage)
{   
    var top_pages = this_of_searchPage.pages_from_server_to_use;
    top_pages.sort(function(page1, page2){return page2.num_of_links_in_page - page1.num_of_links_in_page});
    top_pages.sort(function(page1, page2){return page2.jaccard_similarity - page1.jaccard_similarity});
    top_pages=sort_pages(top_pages);
    var pages_ref=this_of_searchPage.state.pages_ref;
    
    for (var page_ref_index=0; page_ref_index<top_pages.length; page_ref_index++)
        if (top_pages[page_ref_index]!=null)
            pages_ref.push(top_pages[page_ref_index]);
    
    var is_more_pages_button_hidden=false;
    if (pages_ref.length>=this_of_searchPage.full_pages_list_from_server.length)
        is_more_pages_button_hidden=true;
    this_of_searchPage.setState({
        pages_ref: pages_ref,
        pages_in_search: [],
        is_more_pages_button_hidden:is_more_pages_button_hidden
    });
    this_of_searchPage.page_displayed_so_far_index=pages_ref.length-1;
    this_of_searchPage.top_pages=top_pages;
    this_of_searchPage.ref_pages_for_histoty=pages_ref;
}