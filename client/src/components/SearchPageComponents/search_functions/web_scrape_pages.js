import axios from 'axios';

import hash_and_search_page from './hash_and_search_page';

export default async function web_scrape_pages(this_of_searchPage){
    var promiseArray = this_of_searchPage.page_topic_edges_from_server_to_use.map(page_to_topic_edge=>{
        return axios.get("/api/page_topic_edges/web_scrape/?pageID="+page_to_topic_edge.page._id + "&edgeID=" + page_to_topic_edge._id + "&force_scrape=false",{
        })
        .then((result) => {
            if (result.data.is_edge_up_to_date == true)
            {
                page_to_topic_edge.jaccard_similarity= result.data.jaccard_similarity;
                page_to_topic_edge.num_of_links_in_page= result.data.num_of_links_in_page;
                this_of_searchPage.pagesTempState[page_to_topic_edge.index].scrape="fa fa-check-circle-o";
            }
            else
            {
                hash_and_search_page(page_to_topic_edge, result.data.pageHTML, this_of_searchPage).then(()=>
                {
                    this_of_searchPage.pagesTempState[page_to_topic_edge.index].scrape="fa fa-check-circle-o";
                }).catch(()=>
                {
                    this_of_searchPage.pagesTempState[page_to_topic_edge.index].scrape= "fa fa-times-circle-o";
                });
            }
        }).catch( (error) => {
            this_of_searchPage.page.jaccard_similarity=0;
            this_of_searchPage.page.num_of_links_in_page=0;
            this_of_searchPage.pagesTempState[page_to_topic_edge.index].scrape= "fa fa-times-circle-o";
            console.log(error.message);
        });
      });
    await Promise.all(promiseArray).then(results => {
    console.log(results)
    }).catch(function(error) {
        console.log(error);
    });
    this_of_searchPage.pageSearchFinished=true;
}