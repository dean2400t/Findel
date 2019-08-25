import axios from 'axios';

import hash_and_search_page from './hash_and_search_page';

export default async function web_scrape_pages(this_of_searchPage){
    var promiseArray = this_of_searchPage.pages_from_server_to_use.map(page=>{
        return axios.get("/api/pages_to_topics/web_scrape/?pageID="+page.pageID + "&edgeID=" + page.edgeID + "&force_scrape=false",{
        })
        .then((result) => {
            if (result.data.is_edge_up_to_date == true)
            {
                page.jaccard_similarity= result.data.jaccard_similarity;
                page.num_of_links_in_page= result.data.num_of_links_in_page;
                this_of_searchPage.pagesTempState[page.index].scrape="fa fa-check-circle-o";
            }
            else
            {
                hash_and_search_page(page, result.data.pageHTML, this_of_searchPage).then(()=>
                {this_of_searchPage.pagesTempState[page.index].scrape="fa fa-check-circle-o";
                }).catch(()=>
                {
                    this_of_searchPage.pagesTempState[page.index].scrape= "fa fa-times-circle-o";
                });
            }
        }).catch( () => {
            this_of_searchPage.page.jaccard_similarity=0;
            this_of_searchPage.page.num_of_links_in_page=0;
            this_of_searchPage.pagesTempState[page.index].scrape= "fa fa-times-circle-o";
        });
      });
    await Promise.all(promiseArray).then(results => {
    console.log(results)
    }).catch(function(error) {
        console.log(error);
    });
    this_of_searchPage.pageSearchFinished=true;
}