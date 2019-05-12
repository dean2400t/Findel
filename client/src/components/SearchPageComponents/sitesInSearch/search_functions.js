import axios from 'axios';
import rabinKarpSearch from "./rabinKarpSearch";
import Jaccard_similarity from './jaccard_similarity';
import cheerio from 'cheerio';

class Search_functions{
    Search_functions(){}

    
    async search_using_wikipedia(connected_topics_and_edges, wikiText, is_search_requiered ,this_of_searchPage){
        await this.request_sites_from_Server(this_of_searchPage.curSearch, this_of_searchPage);
        await this.initSiteSearch(this_of_searchPage);
        var links=[];
        connected_topics_and_edges.forEach(topic_and_edge => {
            links.push(topic_and_edge.topic.topicName);
        });
        this_of_searchPage.rabinKarp= new rabinKarpSearch(3001, 20, this_of_searchPage.sites_from_server.length);
        this_of_searchPage.rabinKarp.hashWikiLinks(links);
        this_of_searchPage.jaccard_similarity=new Jaccard_similarity(3001, 10, wikiText)
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
                this.expandedContent(this_of_searchPage);
                this_of_searchPage.search_button_function_stop_search();
            }
        }
        ,timeToRefresh
        );

        //start scraping asynchronously
        this.request_WebScraping_for_sites(this_of_searchPage);
    }
    request_sites_from_Server= async (search, this_of_searchPage)=>{
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
                var index=0;
                sites.forEach(site => {
                    sitesArray.push({index: index, 
                                    siteID: site.siteID,
                                    edgeID: site.edgeID,
                                    siteURL: site.siteURL,
                                    siteFormatedURL: site.siteFormatedURL,
                                    siteSnap: site.siteSnap,
                                    domain: site.domain,
                                    userRankCode_for_edge: site.userRankCode,
                                    edgeWeight: site.edgeWeight
                                    });
                    index++;
                });
                this_of_searchPage.sites_from_server=sitesArray;
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
        for (var index=0; index<this_of_searchPage.sites_from_server.length; index++)
            {
                siteToSearchArray.push({id: this_of_searchPage.id, url: this_of_searchPage.sites_from_server[index].siteURL, formatedURL: this_of_searchPage.sites_from_server[index].formatedURL, scrape: stats});
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
    
    hashAndSearchSites= (site, html, this_of_searchPage)=>
    {
        var $ = cheerio.load(html);
        var text= $.text();
        if (text.length>20)
        {
            this_of_searchPage.rabinKarp.creatHashTables(text, index);
            this_of_searchPage.rabinKarp.addHitsFromSite(site, index);
            site.jaccard_similarity = this_of_searchPage.jaccard_similarity.compute_site_similarity(text);
            return true;
        }
        else
            return false;
    }

    request_WebScraping_for_sites= async (this_of_searchPage) =>{
        var promiseArray = this_of_searchPage.sites_from_server.map(site=>{
            return axios.get("/api/webScrape/?siteID="+site.siteID + "&edgeID=" + site.edgeID,{
            })
            .then((result) => {
                if (result.data.site.is_edge_up_to_date == true)
                {
                    site.jaccard_similarity= result.data.site.jaccard_similarity;
                    site.num_of_links_in_site= result.data.site.num_of_links_in_site;
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
        this_of_searchPage.setState({sitesBeingSearched:[]});

        var topSites=this_of_searchPage.sites_from_server;
        topSites.sort(function(site1, site2){return site2.num_of_links_in_site - site1.num_of_links_in_site});
        topSites.sort(function(site1, site2){return site2.jaccard_similarity - site1.jaccard_similarity});
        topSites.sort(function(site1, site2){return site2.edgeWeight - site1.edgeWeight});
        topSites.sort(function(site1, site2){return site2.domain.s - site1.edgeWeight});
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
        var refS=[];
        for (var refSiteIndex=0; refSiteIndex<topSites.length; refSiteIndex++)
        {
            if (topSites[refSiteIndex]!=null)
            {
                refS.push({id: this_of_searchPage.id, 
                    url: topSites[refSiteIndex].url, 
                    formatedURL: topSites[refSiteIndex].formatedURL,
                    siteSnap: topSites[refSiteIndex].siteSnap,
                    userRankCode: topSites[refSiteIndex].userRankCode, 
                    edgeWeight: topSites[refSiteIndex].edgeWeight, 
                    topic: this_of_searchPage.curSearch, 
                    hits: topSites[refSiteIndex].numOfHits});
                this_of_searchPage.id++;
            }
        }
        this_of_searchPage.setState({
            refSites: refS
        });
        this_of_searchPage.topSites=topSites;
    }

    expandedContent=(this_of_searchPage)=>
    {
        var linksWithSitesHit=this_of_searchPage.rabinKarp.wikiLinksHashesToWordByLength;
        var topSites=this_of_searchPage.topSites;
        var linksScore=[];
        var linkIndex=0;
        linksWithSitesHit.forEach(linksInLength => {
            linksInLength.forEach(link => {
                if (link.linkName.length>2)
                {
                    link.score=0;
                    linksScore.push(link);
                    for (var siteHitIndex=0; siteHitIndex<topSites.length && siteHitIndex<5; siteHitIndex++)
                        if (link.sitesHits[siteHitIndex]!=null)      
                            linksScore[linkIndex].score+=link.sitesHits[siteHitIndex];
                    linkIndex++;
                }
            });
        });
        linksScore.sort(function(link1, link2){return link2.score - link1.score});

        var expandedCon=[];
        for (var content=0; content<linksScore.length && content<10; content++)
        {
            var partition=" | ";
            if (content+1==linksScore.length && content+1==10)
                partition="";
            expandedCon.push({id: this_of_searchPage.id, page: linksScore[content].linkName, partition: partition, clicked: this_of_searchPage.expandedContentClicked.bind(this_of_searchPage)});
            this_of_searchPage.id++;
        }
        this_of_searchPage.setState({
            expandedContents: expandedCon
        });
    }
}
export default Search_functions;