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
        this_of_searchPage.jaccard_similarity=new Jaccard_similarity(3001, 7, wikiText)
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
                                     url:site.siteURL, 
                                     formatedURL: site.siteFormatedURL,
                                     siteSnap: site.siteSnap,
                                     userRankCode: site.userRankCode, 
                                     edgeWeight: site.edgeWeight,
                                     num_of_links_in_Site: site.num_of_links_in_Site,
                                     jaccard_similarity: site.jaccard_similarity
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
                siteToSearchArray.push({id: this_of_searchPage.id, url: this_of_searchPage.sites_from_server[index].url, formatedURL: this_of_searchPage.sites_from_server[index].formatedURL, scrape: stats});
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
    
    hashAndSearchSites= (index, site, this_of_searchPage)=>
    {
        if (this_of_searchPage.sites_and_texts[index].siteText.length>20)
        {
            this_of_searchPage.rabinKarp.creatHashTables(this_of_searchPage.sites_and_texts[index].siteText,index);
            this_of_searchPage.rabinKarp.addHitsFromSite(index, site);

            var $ = cheerio.load(this_of_searchPage.sites_and_texts[index].siteText)
            var text= $.text();
            site.jaccard_similarity = this_of_searchPage.jaccard_similarity.compute_site_similarity(text);
            return true;
        }
        else
            return false;
    }

    request_WebScraping_for_sites= async (this_of_searchPage) =>{
        
        var promiseArray = this_of_searchPage.sites_from_server.map(site=>{
            return axios.get("/api/webScrape/?urlToScrape="+site.url,{
            })
            .then((result) => {
                if (result.data.site!=null && result.data.siteText==null)
                {
                    this_of_searchPage.sites_and_texts.push({site: site, siteText: "", was_ok: true});
                    this_of_searchPage.sitesTempState[site.index].scrape="fa fa-check-circle-o";
                }
                else
                {
                    var did_finish_scrape = this.finishedSiteFetch(site, result.data.siteText, result.status, site.index, this_of_searchPage);
                    if (did_finish_scrape)
                    {
                        var did_finish_rabin_search= this.hashAndSearchSites(site.index, site, this_of_searchPage);
                        if (did_finish_rabin_search)
                        {
                            this_of_searchPage.sitesTempState[site.index].scrape="fa fa-check-circle-o";

                        }
                        else
                            this_of_searchPage.sitesTempState[site.index].scrape= "fa fa-times-circle-o";
                    }
                    else
                        this_of_searchPage.sitesTempState[site.index].scrape= "fa fa-times-circle-o";
                }
            }).catch( () => {
                this_of_searchPage.sites_and_texts.push({site: site, siteText: "", was_ok: false});
                this_of_searchPage.sitesTempState[site.index].scrape= "fa fa-times-circle-o";
                this_of_searchPage.sitesFinishedScrape++;
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

        var topSites=this_of_searchPage.sites_and_texts;
        topSites.sort(function(site1, site2){return site2.site.numOfHits - site1.site.numOfHits});
        topSites.sort(function(site1, site2){return site2.site.jaccard_similarity - site1.site.jaccard_similarity});
        topSites.sort(function(site1, site2){return site2.site.edgeWeight - site1.site.edgeWeight});
        topSites.sort(function(site1, site2){
            if (site2.site.userRankCode==site1.site.userRankCode)
                return 0;
            if (site2.site.userRankCode==1 && site1.site.userRankCode!=1)
                return 1;
            else if (site2.site.userRankCode!=1 && site1.site.userRankCode==1)
                return -1;
            else if (site2.site.userRankCode==2 && site1.site.userRankCode==0)
                return -1;
        });
        var refS=[];
        for (var refSiteIndex=0; refSiteIndex<topSites.length; refSiteIndex++)
        {
            if (topSites[refSiteIndex]!=null)
            {
                refS.push({id: this_of_searchPage.id, 
                    url: topSites[refSiteIndex].site.url, 
                    formatedURL: topSites[refSiteIndex].site.formatedURL,
                    siteSnap: topSites[refSiteIndex].site.siteSnap,
                    userRankCode: topSites[refSiteIndex].site.userRankCode, 
                    edgeWeight: topSites[refSiteIndex].site.edgeWeight, 
                    topic: this_of_searchPage.curSearch, 
                    hits: topSites[refSiteIndex].site.numOfHits});
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