import axios from 'axios';
import rabinKarpSearch from "./rabinKarpSearch";
import Jaccard_similarity from './jaccard_similarity';
import cheerio from 'cheerio';

class Search_functions{
    Search_functions(){}

    
    async search_using_wikipedia(wikiText ,this_of_searchPage){
        await this.request_sites_from_Server_to_use(this_of_searchPage.curSearch, this_of_searchPage);
        if (this_of_searchPage.sites_from_server_to_use!=null)
        {
            await this.initSiteSearch(this_of_searchPage);
            var links=[];
            for (var index=0; index<this_of_searchPage.connected_topics_edges.length; index++)
            {
                this_of_searchPage.connected_topics_edges[index].linkHits=0;
                links.push({topicName: this_of_searchPage.connected_topics_edges[index].topic1.topicName, index_in_connected_topics_edges:index});
            }
            this_of_searchPage.rabinKarp= new rabinKarpSearch(3001, 20, this_of_searchPage.sites_from_server_to_use.length);
            this_of_searchPage.rabinKarp.hashWikiLinks(links);
            this_of_searchPage.jaccard_similarity=new Jaccard_similarity(20399, 10, wikiText)
            this_of_searchPage.sitesTempState=this_of_searchPage.state.sitesBeingSearched;
            
            var timeToRefresh=750;

            let refreshSearchStatus=setInterval(
            () => {
                if (this_of_searchPage.siteSearchFinished==false && this_of_searchPage.did_user_ended_seach==false)
                    this_of_searchPage.setState({sitesBeingSearched: this_of_searchPage.sitesTempState});
                else
                {
                    clearInterval(refreshSearchStatus);
                    this_of_searchPage.siteSearchFinished=false;
                    this.rankSites(this_of_searchPage);
                    this.search_expended_content(this_of_searchPage);
                    this_of_searchPage.search_button_function_stop_search();
                }
            }
            ,timeToRefresh
            );

            //start scraping asynchronously
            this.request_WebScraping_for_sites(this_of_searchPage);
        }
        else
            this_of_searchPage.search_button_function_stop_search();
    }
    request_sites_from_Server_to_use= async (search, this_of_searchPage)=>{
        await axios.get("/api/topicsToSitesData/?search="+search,{
            headers: {'findel-auth-token': this_of_searchPage.token}
        })
            .then((result) => {
                // Get the result
                // If we want text, call result.text()
                return result.data;
            }).then((sites) => {
                // Do something with the result
                var sitesArray=[];
                var full_sites_array=[];
                var num_of_initial_sites=15;
                for (var index=0; index<sites.length; index++)
                    full_sites_array.push({index: index, 
                        siteID: sites[index].siteID,
                        edgeID: sites[index].edgeID,
                        siteURL: sites[index].siteURL,
                        formatedURL: sites[index].siteFormatedURL,
                        siteSnap: sites[index].siteSnap,
                        domain: sites[index].domain,
                        userRankCode_for_edge: sites[index].userRankCode,
                        edgeWeight: sites[index].edgeWeight
                        });
                full_sites_array.sort(function(site1, site2){return site2.domain.score - site1.domain.score});
                full_sites_array.sort(function(site1, site2){return site2.edgeWeight - site1.edgeWeight});
                full_sites_array.sort(function(site1, site2){
                    if (site2.userRankCode==site1.userRankCode)
                        return 0;
                    if (site2.userRankCode==1 && site1.userRankCode!=1)
                        return 1;
                    else if (site2.userRankCode!=1 && site1.userRankCode==1)
                        return -1;
                    else if (site2.userRankCode==2 && site1.userRankCode==0)
                        return -1;
                });
                for (var index=0; index<full_sites_array.length && index<num_of_initial_sites; index++)
                    sitesArray.push({index: index, 
                                siteID: sites[index].siteID,
                                edgeID: sites[index].edgeID,
                                siteURL: sites[index].siteURL,
                                formatedURL: sites[index].siteFormatedURL,
                                siteSnap: sites[index].siteSnap,
                                domain: sites[index].domain,
                                userRankCode_for_edge: sites[index].userRankCode,
                                edgeWeight: sites[index].edgeWeight
                                });
                this_of_searchPage.sites_from_server_to_use=sitesArray;
                this_of_searchPage.full_sites_list_from_server=full_sites_array;
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

    initSiteSearch= (this_of_searchPage)=>{
        var siteToSearchArray=[];
        var stats="fa fa-spinner fa-spin";
        for (var index=0; index<this_of_searchPage.sites_from_server_to_use.length; index++)
            {
                siteToSearchArray.push({id: this_of_searchPage.id, siteURL: this_of_searchPage.sites_from_server_to_use[index].siteURL, formatedURL: this_of_searchPage.sites_from_server_to_use[index].formatedURL, scrape: stats});
                this_of_searchPage.id++;
            }
        this_of_searchPage.setState({
            sitesBeingSearched: siteToSearchArray
        });
        
    }

    finishedSiteFetch= (site, text, resStatus, index, this_of_searchPage) =>
    {
        if (resStatus!=200)
            text="";
        this_of_searchPage.sites_and_texts[index]=({site: site, siteText: text});
        if (this_of_searchPage.sites_and_texts[index]!=undefined)
        {
            if (this_of_searchPage.sites_and_texts[index].siteText==="")
                return false;
            else
                return true;
        }
        else
            return false;
    }
    
    hashAndSearchSites= async (site, html, this_of_searchPage)=>
    {
        var $ = cheerio.load(html);
        var text= $.text();
        if (text.length>20)
        {
            this_of_searchPage.rabinKarp.creatHashTables(text, site.index);
            this_of_searchPage.rabinKarp.addHitsFromSite(site, site.index);
            site.jaccard_similarity = this_of_searchPage.jaccard_similarity.compute_site_similarity(text);
            site.was_site_searched=true;
            var opts={
                edgeID: site.edgeID,
                jaccard_similarity: site.jaccard_similarity,
                num_of_links_in_site: site.num_of_links_in_site
              };
            await axios.post('/api/userInsertData/insertSiteTopicEdgeScores', opts, {
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

    request_WebScraping_for_sites= async (this_of_searchPage) =>{
        var promiseArray = this_of_searchPage.sites_from_server_to_use.map(site=>{
            return axios.get("/api/webScrape/?siteID="+site.siteID + "&edgeID=" + site.edgeID + "&force_scrape=false",{
            })
            .then((result) => {
                if (result.data.is_edge_up_to_date == true)
                {
                    site.jaccard_similarity= result.data.jaccard_similarity;
                    site.num_of_links_in_site= result.data.num_of_links_in_site;
                    this_of_searchPage.sitesTempState[site.index].scrape="fa fa-check-circle-o";
                }
                else
                {
                    var did_finish_search= this.hashAndSearchSites(site, result.data.siteHTML, this_of_searchPage);
                    if (did_finish_search)
                        this_of_searchPage.sitesTempState[site.index].scrape="fa fa-check-circle-o";
                    else
                        this_of_searchPage.sitesTempState[site.index].scrape= "fa fa-times-circle-o";
                }
            }).catch( () => {
                this_of_searchPage.site.jaccard_similarity=0;
                this_of_searchPage.site.num_of_links_in_site=0;
                this_of_searchPage.sitesTempState[site.index].scrape= "fa fa-times-circle-o";
            });
          });
        await Promise.all(promiseArray).then(results => {
        console.log(results)
        }).catch(function(error) {
            console.log(error);
        });
        this_of_searchPage.siteSearchFinished=true;
    }


    rankSites=(this_of_searchPage)=>
    {   
        var topSites = this_of_searchPage.sites_from_server_to_use;
        topSites.sort(function(site1, site2){return site2.num_of_links_in_site - site1.num_of_links_in_site});
        topSites.sort(function(site1, site2){return site2.jaccard_similarity - site1.jaccard_similarity});
        topSites.sort(function(site1, site2){return site2.domain.score - site1.domain.score});
        topSites.sort(function(site1, site2){return site2.edgeWeight - site1.edgeWeight});
        topSites.sort(function(site1, site2){
            if (site2.userRankCode==site1.userRankCode)
                return 0;
            if (site2.userRankCode==1 && site1.userRankCode!=1)
                return 1;
            else if (site2.userRankCode!=1 && site1.userRankCode==1)
                return -1;
            else if (site2.userRankCode==2 && site1.userRankCode==0)
                return -1;
        });
        var refS=this_of_searchPage.state.refSites;
        for (var refSiteIndex=0; refSiteIndex<topSites.length; refSiteIndex++)
        {
            if (topSites[refSiteIndex]!=null)
            {
                refS.push({id: this_of_searchPage.id, 
                    siteID: topSites[refSiteIndex].siteID,
                    edgeID: topSites[refSiteIndex].edgeID,  
                    siteURL: topSites[refSiteIndex].siteURL, 
                    formatedURL: topSites[refSiteIndex].formatedURL,
                    siteSnap: topSites[refSiteIndex].siteSnap,
                    domain: topSites[refSiteIndex].domain,
                    userRankCode: topSites[refSiteIndex].userRankCode_for_edge, 
                    edgeWeight: topSites[refSiteIndex].edgeWeight});
                this_of_searchPage.id++;
            }
        }
        var is_more_sites_button_hidden=false;
        if (refS.length>=this_of_searchPage.full_sites_list_from_server.length)
            is_more_sites_button_hidden=true;
        this_of_searchPage.setState({
            refSites: refS,
            sitesBeingSearched: [],
            is_more_sites_button_hidden:is_more_sites_button_hidden
        });
        this_of_searchPage.site_displayed_so_far_index=refS.length-1;
        this_of_searchPage.topSites=topSites;
    }

    display_expended_content = (this_of_searchPage) =>
    {
        var connected_topics_edges=this_of_searchPage.connected_topics_edges;
        connected_topics_edges.sort(function(edge1, edge2){return edge2.web_scrape_score - edge1.web_scrape_score});
        connected_topics_edges.sort(function(edge1, edge2){return edge2.linkHits - edge1.linkHits});
        connected_topics_edges.sort(function(edge1, edge2){if (edge2.topic1.topicName.length<3 && edge1.topic1.topicName.length>=3) return -1;});
        connected_topics_edges.sort(function(edge1, edge2){return edge2.weight - edge1.weight});
        connected_topics_edges.sort(function(edge1, edge2){
            if (edge2.userRankCode==edge1.userRankCode)
                return 0;
            if (edge2.userRankCode==1 && edge1.userRankCode!=1)
                return 1;
            else if (edge2.userRankCode!=1 && edge1.userRankCode==1)
                return -1;
            else if (edge2.userRankCode==2 && edge1.userRankCode==0)
                return -1;
        });
        
        var expandedCon=[];
        for (var content=0; content<connected_topics_edges.length && content<10; content++)
        {
            var partition=" | ";
            expandedCon.push({id: this_of_searchPage.id, 
                page: connected_topics_edges[content].topic1.topicName, 
                partition: partition, 
                clicked: this_of_searchPage.expandedContentClicked.bind(this_of_searchPage)});
            this_of_searchPage.id++;
        }
        this_of_searchPage.setState({
            expandedContents: expandedCon,
            is_show_more_content_hidden: false,
            expandend_content_status: ""
        });
    }

    async best_sites_results(this_of_searchPage, rk_results)
    {
        var topSites=this_of_searchPage.topSites;
        var num_of_top_sites_to_use=6;
        var num_of_top_sites_used=0;
        for (var index=0; index<topSites.length && num_of_top_sites_used<num_of_top_sites_to_use; index++)
            if (topSites[index].was_site_searched!=true)
            {
                await axios.get("/api/webScrape/?siteID="+topSites[index].siteID + "&edgeID=" + topSites[index].edgeID + "&force_scrape=true",{
                })
                .then(async (result) => {
                    await this.hashAndSearchSites(topSites[index], result.data.siteHTML, this_of_searchPage); 
                    topSites[index].was_site_searched=true;
                    await rk_results.forEach(words_in_length => {
                        words_in_length.forEach(word => {
                            var num_of_hits=word.sitesHits[topSites[index].index];
                            if (num_of_hits != undefined)
                                this_of_searchPage.connected_topics_edges[word.index_in_connected_topics_edges].linkHits += num_of_hits;
                        });
                    });
                    num_of_top_sites_used++;
                }).catch( () => {
                    console.log("site failed searched");
                });
            }
            else if (topSites[index].was_site_searched==true)
            {
                rk_results.forEach(words_in_length => {
                    words_in_length.forEach(word => {
                        var num_of_hits=word.sitesHits[topSites[index].index];
                        if (num_of_hits != undefined)
                            this_of_searchPage.connected_topics_edges[word.index_in_connected_topics_edges].linkHits += num_of_hits;
                    });
                });
                num_of_top_sites_used++;
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
            var rk_results = this_of_searchPage.rabinKarp.wikiLinksHashesToWordByLength;
            this.best_sites_results(this_of_searchPage, rk_results)
            .then(()=>{
                this.display_expended_content(this_of_searchPage);
                connected_topics_edges.forEach(connected_topic_edge => {
                    if (connected_topic_edge.is_search_required)
                    {
                        var opts={
                            id_of_edge_to_update: connected_topic_edge.edgeID,
                            web_scrape_score: connected_topic_edge.linkHits
                        };
                        axios.post('/api/userInsertData/insertTopicTopicEdgeScores', opts
                            ).then(response => {
                                console.log(response.data);
                            }).catch(error=> {
                                if (error.response==undefined)
                                console.log("אין חיבור לשרת");
                                else
                                console.log(error.response.data);
                        });
                    }
                })})
            .catch(() => {console.log("Search content failed");});
        }
        else
            this.display_expended_content(this_of_searchPage);
    }
}
export default Search_functions;