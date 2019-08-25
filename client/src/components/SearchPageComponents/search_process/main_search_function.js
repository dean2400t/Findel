
//imported according to the search proccess flow
import request_topic_and_connected_topics_from_server from './request_topic_and_connected_topics_from_server';
import request_pages_from_server from './request_pages_from_server';
import display_pages_scrape_process from './display_pages_scrape_process';
import Rabin_Karp_search from "./Rabin_Karp_search";
import Jaccard_similarity from './Jaccard_similarity';
import web_scrape_pages from './web_scrape_pages';
import rank_pages from './rank_pages';
import search_for_expended_content from './search_for_expended_content';
import display_expended_content from './display_expanded_content';
import update_topic_to_topic_edges_results from './update_topic_to_topic_edges_results';

export default async function main_search_function(this_of_searchPage, do_deep_search)
{

    if (do_deep_search != true)
        do_deep_search= false;
    
    await request_topic_and_connected_topics_from_server(this_of_searchPage)
    
    if (this_of_searchPage.ambigousData.length==0)
    {
        await request_pages_from_server(this_of_searchPage.curSearch, this_of_searchPage);
        
        if (this_of_searchPage.connected_topics_edges == null)
            do_deep_search= false;
        else if(this_of_searchPage.connected_topics_edges.length==0)
            do_deep_search= false;

        if (do_deep_search == false)
        {
            rank_pages(this_of_searchPage);
            display_expended_content(this_of_searchPage);
            this_of_searchPage.search_button_function_stop_search();
        }
        else if (this_of_searchPage.pages_from_server_to_use!=null)
        {
            display_pages_scrape_process(this_of_searchPage);
            
            //build rabin karp hash tables and Jaccrad similarity shingles table for wikipedia page
            var links=[];
            for (var index=0; index<this_of_searchPage.connected_topics_edges.length; index++)
            {
                this_of_searchPage.connected_topics_edges[index].linkHits=0;
                links.push({topicName: this_of_searchPage.connected_topics_edges[index].topic.topicName, index_in_connected_topics_edges:index});
            }
            this_of_searchPage.rabinKarp= new Rabin_Karp_search(3001, 20, this_of_searchPage.pages_from_server_to_use.length);
            this_of_searchPage.rabinKarp.hashWikiLinks(links);
            this_of_searchPage.jaccard_similarity=new Jaccard_similarity(20399, 10, wikiText)
            this_of_searchPage.pagesTempState=this_of_searchPage.state.pages_in_search;
            
            //start scraping asynchronously
            web_scrape_pages(this_of_searchPage);

            var timeToRefresh=750;
            //function to show status of pages search and check if user requested to stop
            let refreshSearchStatus=setInterval(
            async () => {
                if (this_of_searchPage.pageSearchFinished==false && this_of_searchPage.did_user_ended_seach==false)
                    this_of_searchPage.setState({pages_in_search: this_of_searchPage.pagesTempState});
                else
                {
                    clearInterval(refreshSearchStatus);
                    this_of_searchPage.pageSearchFinished=false;
                    rank_pages(this_of_searchPage);
                    search_for_expended_content(this_of_searchPage);
                    display_expended_content(this_of_searchPage);
                    update_topic_to_topic_edges_results(this_of_searchPage);
                    this_of_searchPage.search_button_function_stop_search();
                }
            }
            ,timeToRefresh
            );

        }
        else
            this_of_searchPage.search_button_function_stop_search();
    }
}
