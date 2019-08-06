import axios from 'axios';
import Rabin_Karp_search from "./Rabin_Karp_search";
import Jaccard_similarity from './Jaccard_similarity';
import cheerio from 'cheerio';

class Search_functions{
    Search_functions(){}

    async search_using_wikipedia(wikiText ,this_of_searchPage){
        await this.request_pages_from_Server_to_use(this_of_searchPage.curSearch, this_of_searchPage);
        if (this_of_searchPage.pages_from_server_to_use!=null)
        {
            await this.init_pages_search(this_of_searchPage);
            var links=[];
            for (var index=0; index<this_of_searchPage.connected_topics_edges.length; index++)
            {
                this_of_searchPage.connected_topics_edges[index].linkHits=0;
                links.push({topicName: this_of_searchPage.connected_topics_edges[index].topic1.topicName, index_in_connected_topics_edges:index});
            }
            this_of_searchPage.rabinKarp= new Rabin_Karp_search(3001, 20, this_of_searchPage.pages_from_server_to_use.length);
            this_of_searchPage.rabinKarp.hashWikiLinks(links);
            this_of_searchPage.jaccard_similarity=new Jaccard_similarity(20399, 10, wikiText)
            this_of_searchPage.pagesTempState=this_of_searchPage.state.pages_in_search;
            
            var timeToRefresh=750;

            let refreshSearchStatus=setInterval(
            () => {
                if (this_of_searchPage.pageSearchFinished==false && this_of_searchPage.did_user_ended_seach==false)
                    this_of_searchPage.setState({pages_in_search: this_of_searchPage.pagesTempState});
                else
                {
                    clearInterval(refreshSearchStatus);
                    this_of_searchPage.pageSearchFinished=false;
                    this.rank_pages(this_of_searchPage);
                    this.search_expended_content(this_of_searchPage);
                    this_of_searchPage.search_button_function_stop_search();
                }
            }
            ,timeToRefresh
            );

            //start scraping asynchronously
            this.request_WebScraping_for_pages(this_of_searchPage);
        }
        else
            this_of_searchPage.search_button_function_stop_search();
    }
    shuffle_pages_from_google(full_pages_array)
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
            if (page2.domain.score < 1 && page1.domain.score>=1)
                return -1;
            else if (page2.domain.score >= 1 && page1.domain.score < 1)
                return 1;
            else if (page2.domain.score < 1 && page1.domain.score < 1)
                return page2.domain.score-page1.domain.score;
            else
            return 0;
        });
        full_pages_array.sort(function(page1, page2){return page2.educational_weight - page1.educational_weight});
        full_pages_array.sort(function(page1, page2){return page2.credibility_weight - page1.credibility_weight});
        full_pages_array.sort(function(page1, page2){return page2.liked_weight - page1.liked_weight});
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
/*
    shuffle_pages_from_google(full_pages_array)
    {
        full_pages_array.sort(function(page1, page2){
            if (page2.order_index_by_google===0) return 1;
            if (page1.order_index_by_google===0) return -1;
            if (page2.order_index_by_google==null && page1.order_index_by_google==null) return 0;
            if (page2.order_index_by_google!=null && page1.order_index_by_google==null) return 1;
            if (page2.order_index_by_google==null && page1.order_index_by_google!=null) return -1;
            return page1.order_index_by_google-page2.order_index_by_google;
        });
        full_pages_array.sort(function(page1, page2){return page2.domain.score - page1.domain.score});
        full_pages_array.sort(function(page1, page2){return page2.edgeWeight - page1.edgeWeight});
        var shuffled_pages=[];

        var full_pages_index=0;
        while (full_pages_index<full_pages_array.length && full_pages_array[full_pages_index].edgeWeight>1)
        {
            shuffled_pages.push(full_pages_array[full_pages_index]);
            full_pages_index++;
        }
        
        var domains_page_array=[];
        var domains_index=-1;
        var domainURL="";

        var still_has_some=[];
        while (full_pages_index<full_pages_array.length)
        {
            if (full_pages_array[full_pages_index].domain.score<1)
                break;
            if (domainURL==full_pages_array[full_pages_index].domain.domainURL)
            {
                domains_page_array[domains_index].pages.push(full_pages_array[full_pages_index]);
                full_pages_index++;
            }
            else
            {
                domains_index++;
                domainURL = full_pages_array[full_pages_index].domain.domainURL;
                domains_page_array.push({domainURL: domainURL, pages: [full_pages_array[full_pages_index]], cur_page_index: 0});
                still_has_some.push(domains_index);
                full_pages_index++;
            }
        }
        while(still_has_some.length>0)
            for (var has_index=0; has_index<still_has_some.length; has_index++)
            {
                var domain=domains_page_array[still_has_some[has_index]];
                shuffled_pages.push(domain.pages[domain.cur_page_index]);
                domain.cur_page_index++;
                if (domain.cur_page_index<domain.pages.length)
                {
                    shuffled_pages.push(domain.pages[domain.cur_page_index]);
                    domain.cur_page_index++;
                }
                if (domain.cur_page_index>=domain.pages.length)
                {
                    still_has_some.splice(has_index,1);
                    has_index--;
                }
            }
        for (full_pages_index; full_pages_index<full_pages_array.length; full_pages_index++)
            shuffled_pages.push(full_pages_array[full_pages_index]);
        return shuffled_pages;
    }
    */
    
    request_pages_from_Server_to_use= async (search, this_of_searchPage)=>{
        await axios.get("/api/topics_to_pages_data/?search="+search,{
            headers: {'findel-auth-token': this_of_searchPage.token}
        })
            .then((result) => {
                // Get the result
                // If we want text, call result.text()
                return result.data;
            }).then((pages) => {
                // Do something with the result
                var pagesArray=[];
                var full_pages_array=[];
                var num_of_initial_pages=9;
                for (var index=0; index<pages.length; index++)
                {
                    if (pages[index].domain==null)
                        pages[index].domain={domainURL: "nullURL", score: 0};
                    full_pages_array.push({
                        pageID: pages[index].pageID,
                        edgeID: pages[index].edgeID,
                        pageURL: pages[index].pageURL,
                        formatedURL: pages[index].pageFormatedURL,
                        pageSnap: pages[index].pageSnap,
                        domain: pages[index].domain,
                        user_rankings_for_edge: pages[index].user_rankings,
                        liked_weight: pages[index].liked_weight,
                        credibility_weight: pages[index].credibility_weight,
                        educational_weight: pages[index].educational_weight,
                        order_index_by_google: pages[index].order_index_by_google
                        });
                    }
                var shuffled_pages = this.shuffle_pages_from_google(full_pages_array);
                
                for (var index=0; index<shuffled_pages.length; index++)
                    shuffled_pages[index].index=index;
                
                for (var index=0; index<shuffled_pages.length && index<num_of_initial_pages; index++)
                    pagesArray.push({index: index, 
                                pageID: shuffled_pages[index].pageID,
                                edgeID: shuffled_pages[index].edgeID,
                                pageURL: shuffled_pages[index].pageURL,
                                formatedURL: shuffled_pages[index].formatedURL,
                                pageSnap: shuffled_pages[index].pageSnap,
                                domain: shuffled_pages[index].domain,
                                user_rankings_for_edge: shuffled_pages[index].user_rankings_for_edge,
                                liked_weight: shuffled_pages[index].liked_weight,
                                credibility_weight: shuffled_pages[index].credibility_weight,
                                educational_weight: shuffled_pages[index].educational_weight,
                                order_index_by_google: shuffled_pages[index].order_index_by_google
                                });
                this_of_searchPage.pages_from_server_to_use=pagesArray;
                this_of_searchPage.full_pages_list_from_server=shuffled_pages;
            }).catch((error) => {
                if (error.message==="Network Error")
                    this_of_searchPage.setState({
                        server_message: "לא מצליח להגיע לשרת"
                    });
                else
                    this_of_searchPage.setState({
                        server_message: error.response.data
                    });
            });
    }

    init_pages_search= (this_of_searchPage)=>{
        var pageToSearchArray=[];
        var stats="fa fa-spinner fa-spin";
        for (var index=0; index<this_of_searchPage.pages_from_server_to_use.length; index++)
            {
                pageToSearchArray.push({id: this_of_searchPage.id, pageURL: this_of_searchPage.pages_from_server_to_use[index].pageURL, formatedURL: this_of_searchPage.pages_from_server_to_use[index].formatedURL, scrape: stats});
                this_of_searchPage.id++;
            }
        this_of_searchPage.setState({
            pages_in_search: pageToSearchArray
        });
        
    }
    
    hash_and_search_pages= async (page, html, this_of_searchPage)=>
    {
        var $ = cheerio.load(html);
        var text= $.text();
        if (text.length>20)
        {
            this_of_searchPage.rabinKarp.creatHashTables(text, page.index);
            this_of_searchPage.rabinKarp.add_hits_from_page(page, page.index);
            page.jaccard_similarity = this_of_searchPage.jaccard_similarity.compute_page_similarity(text);
            page.was_page_searched=true;
            var opts={
                edgeID: page.edgeID,
                jaccard_similarity: page.jaccard_similarity,
                num_of_links_in_page: page.num_of_links_in_page
              };
            await axios.post('/api/userInsertData/insert_page_topic_edge_scores', opts, {
            headers: {'findel-auth-token': this.token}}
                ).then(response => {
                    console.log("edge successfuly added");
                }).catch(error=> {
                    console.log("edge could not be added");
            });
            return true;
        }
        else
            return false;
    }

    request_WebScraping_for_pages= async (this_of_searchPage) =>{
        var promiseArray = this_of_searchPage.pages_from_server_to_use.map(page=>{
            return axios.get("/api/webScrape/?pageID="+page.pageID + "&edgeID=" + page.edgeID + "&force_scrape=false",{
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
                    this.hash_and_search_pages(page, result.data.pageHTML, this_of_searchPage).then(()=>
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


    rank_pages=(this_of_searchPage)=>
    {   
        var top_pages = this_of_searchPage.pages_from_server_to_use;
        top_pages.sort(function(page1, page2){return page2.num_of_links_in_page - page1.num_of_links_in_page});
        top_pages.sort(function(page1, page2){return page2.jaccard_similarity - page1.jaccard_similarity});
        top_pages=this.shuffle_pages_from_google(top_pages);
        var pages_ref=this_of_searchPage.state.pages_ref;
        for (var page_ref_index=0; page_ref_index<top_pages.length; page_ref_index++)
        {
            if (top_pages[page_ref_index]!=null)
            {
                pages_ref.push({id: this_of_searchPage.id, 
                    pageID: top_pages[page_ref_index].pageID,
                    edgeID: top_pages[page_ref_index].edgeID,  
                    pageURL: top_pages[page_ref_index].pageURL, 
                    formatedURL: top_pages[page_ref_index].formatedURL,
                    pageSnap: top_pages[page_ref_index].pageSnap,
                    domain: top_pages[page_ref_index].domain,
                    user_rankings_for_edge: top_pages[page_ref_index].user_rankings_for_edge, 
                    liked_weight: top_pages[page_ref_index].liked_weight,
                    credibility_weight: top_pages[page_ref_index].credibility_weight,
                    educational_weight: top_pages[page_ref_index].educational_weight});
                this_of_searchPage.id++;
            }
        }
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

    display_expended_content = (this_of_searchPage) =>
    {
        var connected_topics_edges=this_of_searchPage.connected_topics_edges;
        connected_topics_edges.sort(function(edge1, edge2){return edge2.web_scrape_score - edge1.web_scrape_score});
        connected_topics_edges.sort(function(edge1, edge2){return edge2.linkHits - edge1.linkHits});
        connected_topics_edges.sort(function(edge1, edge2){if (edge2.topic1.topicName.length<3 && edge1.topic1.topicName.length>=3) return -1;});
        connected_topics_edges.sort(function(edge1, edge2){return edge2.liked_weight - edge1.liked_weight});
        
        var expandedCon=[];
        for (var content=0; content<connected_topics_edges.length && content<10; content++)
        {
            var partition=" | ";
            expandedCon.push({id: this_of_searchPage.id, 
                page: connected_topics_edges[content].topic1.topicName, 
                partition: partition
                });
            this_of_searchPage.id++;
        }
        var is_show_more_content_hidden=false;
        if (connected_topics_edges.length==0)
            is_show_more_content_hidden=true;
        this_of_searchPage.setState({
            expandedContents: expandedCon,
            is_show_more_content_hidden: is_show_more_content_hidden,
            expandend_content_status: ""
        });
        this_of_searchPage.expandedCon_to_history=expandedCon;
        
    }

    async best_pages_results(this_of_searchPage, rk_results)
    {
        var top_pages=this_of_searchPage.top_pages;
        var num_of_top_pages_to_use=6;
        var num_of_top_pages_used=0;
        for (var index=0; index<top_pages.length && num_of_top_pages_used<num_of_top_pages_to_use; index++)
            if (top_pages[index].was_page_searched!=true)
            {
                await axios.get("/api/webScrape/?pageID="+top_pages[index].pageID + "&edgeID=" + top_pages[index].edgeID + "&force_scrape=true",{
                })
                .then(async (result) => {
                    await this.hash_and_search_pages(top_pages[index], result.data.pageHTML, this_of_searchPage); 
                    top_pages[index].was_page_searched=true;
                    await rk_results.forEach(words_in_length => {
                        words_in_length.forEach(word => {
                            var num_of_hits=word.pages_hits[top_pages[index].index];
                            if (num_of_hits != undefined)
                                this_of_searchPage.connected_topics_edges[word.index_in_connected_topics_edges].linkHits += num_of_hits;
                        });
                    });
                    num_of_top_pages_used++;
                }).catch( (error) => {
                    console.log("page failed searched");
                });
            }
            else if (top_pages[index].was_page_searched==true)
            {
                rk_results.forEach(words_in_length => {
                    words_in_length.forEach(word => {
                        var num_of_hits=word.pages_hits[top_pages[index].index];
                        if (num_of_hits != undefined)
                            this_of_searchPage.connected_topics_edges[word.index_in_connected_topics_edges].linkHits += num_of_hits;
                    });
                });
                num_of_top_pages_used++;
            }
    }

    search_expended_content(this_of_searchPage)
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
            this.best_pages_results(this_of_searchPage, rk_results)
            .then(()=>{
                this.display_expended_content(this_of_searchPage);
            })
            .then(()=>
            {
                var connected_topics_edges=this_of_searchPage.connected_topics_edges;
                var edges_to_update=[];
                connected_topics_edges.forEach(connected_topic_edge => {
                    if (connected_topic_edge.is_search_required)
                        edges_to_update.push({
                            _id: connected_topic_edge.edgeID,
                            web_scrape_score: connected_topic_edge.linkHits
                        })
                });
                var opts={
                    edges: edges_to_update
                };
                axios.post('/api/userInsertData/insert_topic_topic_edges_scores', opts
                    ).then(response => {
                        console.log(response.data);
                    }).catch(error=> {
                        if (error.response==undefined)
                        console.log("אין חיבור לשרת");
                        else
                        console.log(error.response.data);
                });
            })
            .catch(() => {console.log("Search content failed");});
        }
        else
            this.display_expended_content(this_of_searchPage);
    }
}
export default Search_functions;