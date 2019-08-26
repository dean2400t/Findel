import axios from 'axios';
import hash_and_search_page from './hash_and_search_page';

export default async function search_for_expended_content(this_of_searchPage)
{
    var connected_topics_edges=this_of_searchPage.connected_topics_edges;
    var is_seach_needed=false;
    for (var index=0; index< connected_topics_edges.length; index++)
        if (connected_topics_edges[index].is_search_required==true)
            {
                is_seach_needed=true;
                break;
            }
    if (is_seach_needed)
    {
        var rk_results = this_of_searchPage.rabinKarp.wikiLinks_hashes_to_word_by_length;
        best_pages_results(this_of_searchPage, rk_results)
        .then(()=>{
            console.log("Search content success");
        })
        .catch(() => {console.log("Search content failed");});
    }
}

async function best_pages_results(this_of_searchPage, rk_results)
{
    var top_page_topic_edges=this_of_searchPage.top_page_topic_edges;
    var num_of_top_page_topic_edges_to_use=6;
    var num_of_top_page_topic_edges_used=0;
    for (var index=0; index<top_page_topic_edges.length && num_of_top_page_topic_edges_used<num_of_top_page_topic_edges_to_use; index++)
        if (top_page_topic_edges[index].was_page_searched!=true)
        {
            await axios.get("/api/pages_to_topics/web_scrape/?pageID="+top_page_topic_edges[index].page._id + "&edgeID=" + top_page_topic_edges[index]._id + "&force_scrape=true",{
            })
            .then(async (result) => {
                await hash_and_search_page(top_page_topic_edges[index], result.data.pageHTML, this_of_searchPage); 
                top_page_topic_edges[index].was_page_searched=true;
                await rk_results.forEach(words_in_length => {
                    words_in_length.forEach(word => {
                        var num_of_hits=word.pages_hits[top_page_topic_edges[index].index];
                        if (num_of_hits != undefined)
                            this_of_searchPage.connected_topics_edges[word.index_in_connected_topics_edges].linkHits += num_of_hits;
                    });
                });
                num_of_top_page_topic_edges_used++;
            }).catch( (error) => {
                console.log("page failed searched");
            });
        }
        else if (top_page_topic_edges[index].was_page_searched==true)
        {
            rk_results.forEach(words_in_length => {
                words_in_length.forEach(word => {
                    var num_of_hits=word.pages_hits[top_page_topic_edges[index].index];
                    if (num_of_hits != undefined)
                        this_of_searchPage.connected_topics_edges[word.index_in_connected_topics_edges].linkHits += num_of_hits;
                });
            });
            num_of_top_page_topic_edges_used++;
        }
}