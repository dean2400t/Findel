import axios from 'axios';
import rabinKarpSearch from "./rabinKarpSearch";

class Search_functions{
    Search_functions(){}

    
    async search_using_wikipedia_links(links, this_of_searchPage){
        await this.request_links_and_sites_from_Server(this_of_searchPage.curSearch, this_of_searchPage);
        await this.initSiteSearch(this_of_searchPage);
        this_of_searchPage.rabinKarp= new rabinKarpSearch(3001, 20, this_of_searchPage.sites_from_server.length);
        this_of_searchPage.rabinKarp.hashWikiLinks(links);
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
    request_links_and_sites_from_Server= async (search, this_of_searchPage)=>{
        await axios.get("/api/topicsToSitesData/?search="+search,{
            headers: {'findel-auth-token': this_of_searchPage.token}
        })
            .then((result) => {
                // Get the result
                // If we want text, call result.text()
                return result.data;
            }).then((sites) => {
                // Do something with the result
                var urlsWithIndex=[];
                var index=0;
                sites.forEach(site => {
                    urlsWithIndex.push({index: index, url:site.siteURL, userRankCode: site.userRankCode, edgeWeight: site.edgeWeight});
                    index++;
                });
                this_of_searchPage.sites_from_server=urlsWithIndex;
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
                siteToSearchArray.push({id: this_of_searchPage.id, url: this_of_searchPage.sites_from_server[index].url, scrape: stats, hash: "", searched: ""});
                this_of_searchPage.id++;
            }
        this_of_searchPage.setState({
            sitesBeingSearched: siteToSearchArray
        });
        
    }

    finishedSiteFetch= (url, text, resStatus, index, this_of_searchPage) =>
    {
        if (resStatus!=200)
            text="";
        this_of_searchPage.texts[index]=({url: url, siteText: text});
        if (this_of_searchPage.texts[index]!=undefined)
        {
            if (this_of_searchPage.texts[index].siteText==="")
                this_of_searchPage.sitesTempState[index].scrape= "fa fa-times-circle-o";
            else
                this_of_searchPage.sitesTempState[index].scrape="fa fa-check-circle-o";
        }
        else
            this_of_searchPage.sitesTempState[index].scrape= "fa fa-times-circle-o";
        this_of_searchPage.sitesTempState[index].hash="fa fa-spinner fa-spin";
        this_of_searchPage.sitesFinishedScrape++;
    }
    
    hashAndSearchSites= (index, this_of_searchPage)=>
    {
        if (this_of_searchPage.texts[index].siteText.length>20)
        {
            this_of_searchPage.rabinKarp.creatHashTables(this_of_searchPage.texts[index].siteText,index);
            this_of_searchPage.sitesTempState[index].hash="fa fa-check-circle-o";
            this_of_searchPage.rabinKarp.addHitsFromSite(index);
            this_of_searchPage.sitesTempState[index].searched="fa fa-check-circle-o";
        }
        else
        {
            this_of_searchPage.sitesTempState[index].hash="fa fa-times-circle-o";
            this_of_searchPage.sitesTempState[index].searched="fa fa-times-circle-o";
        }

        
    }

    request_WebScraping_for_sites= async (this_of_searchPage) =>{
        
        var promiseArray = this_of_searchPage.sites_from_server.map(url=>{
            return axios.get("/api/webScrape/?urlToScrape="+url.url,{
            })
            .then((result) => {
                this.finishedSiteFetch(url.url, result.data, result.status, url.index, this_of_searchPage);
                this.hashAndSearchSites(url.index, this_of_searchPage);
            }).catch( () => {
                this_of_searchPage.texts.push({url: url.url, siteText: ""});
                this_of_searchPage.sitesTempState[url.index].scrape= "fa fa-times-circle-o";
                this_of_searchPage.sitesTempState[url.index].hash="fa fa-times-circle-o";
                this_of_searchPage.sitesTempState[url.index].searched="fa fa-times-circle-o";
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
        var linksWithSitesHit=this_of_searchPage.rabinKarp.wikiLinksHashesToWordByLength;
        
        var topSites=[];
        for (var siteIndex=0; siteIndex<this_of_searchPage.sites_from_server.length; siteIndex++)
            topSites.push({url: this_of_searchPage.sites_from_server[siteIndex].url, userRankCode: this_of_searchPage.sites_from_server[siteIndex].userRankCode, edgeWeight: this_of_searchPage.sites_from_server[siteIndex].edgeWeight, numOfHits: 0, numOfContent: 0, score: 0});

        linksWithSitesHit.forEach(linksInLength => {
            linksInLength.forEach(link => {
                if (link.linkName.length>2)
                    for (var siteHitIndex=0; siteHitIndex<link.sitesHits.length; siteHitIndex++)
                        if (link.sitesHits[siteHitIndex]!=null)
                        {
                            topSites[siteHitIndex].numOfHits+=link.sitesHits[siteHitIndex];
                            topSites[siteHitIndex].numOfContent++;
                        }
            });
        });
        this_of_searchPage.setState({sitesBeingSearched:[]});

        topSites.sort(function(site1, site2){return site2.numOfHits - site1.numOfHits});
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
        var refS=[];
        for (var refSiteIndex=0; refSiteIndex<topSites.length; refSiteIndex++)
        {
            refS.push({id: this_of_searchPage.id, url: topSites[refSiteIndex].url, userRankCode: topSites[refSiteIndex].userRankCode, edgeWeight: topSites[refSiteIndex].edgeWeight, topic: this_of_searchPage.curSearch, hits: topSites[refSiteIndex].numOfHits});
            this_of_searchPage.id++;
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