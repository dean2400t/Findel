import React, { Component } from 'react';
import SitesToSearch from './SearchPageComponents/sitesInSearch/SitesToSearch';
import ExpandedContent from './SearchPageComponents/expandedContents/ExpandedContents';
import RefSites from './SearchPageComponents/refSites/RefSites';
import Ambigous from './SearchPageComponents/AmbigousContent/Ambigous';

import './SearchPage.css';
import Cookies from 'universal-cookie';
import Search_functions from '../components/SearchPageComponents/sitesInSearch/search_functions';
import Axios from 'axios';
const cookies = new Cookies();
const search_functions=new Search_functions();


class SearchPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
          inputValue: '',
          sitesBeingSearched:[],
          expandedContents: [],
          refSites: [],
          ambigousData: [],
          newID: 1,
          search_button_function: () => this.search_button_function_deep_search(),
          simple_search_button_function: () => this.simple_search_button_function(),
          search_button_text: "חפש תכנים",
          simple_search_button_text:"חיפוש פשוט",
          search_button_iconClass: "",
          server_message:"",
          add_site_to_topic_input:"",
          add_topic_to_topic_input:"",
          was_add_site_button_clicked:false,
          was_add_topic_button_clicked: false
        };
        this.texts=[];
        this.sitesFinishedScrape=0;
        this.sites_from_server=[];
        this.token=cookies.get('findel-auth-token') || "";
        this.sitesTempState=[];
        this.siteSearchFinished=false;
        this.topSites=null;
        this.curSearch=null;

        this.rabinKarp=null;
        this.wikiLinksHashesToWordByLength=[];
        this.wordsMatriciesByLength=[];
        this.id=1;
      }
    render() {
        var search_box_textStyle={color: '#F0F8FF'};
      return (
        
        <div className="SearchPage">
            <div className="search_box_div" style={{ height: '200px', backgroundColor:'#0587c3'}}>
                <h1 style={{fontSize:'10', textAlign: 'center', color: 'white'}}>
                Findel</h1>
                <div>
                    <input id="search_text_box" type="text" value={this.state.inputValue} onChange={evt => this.updateTXT(evt)}></input>
                    <button id="searchBTN" name="searchBTN" onClick={this.state.search_button_function}>{this.state.search_button_text} <i className={this.state.search_button_iconClass}></i></button>
                    <button hidden="true" id="simple_search_BTN" name="simple_search_BTN" onClick={this.state.simple_search_button_function}>{this.state.simple_search_button_text} <i className={this.state.search_button_iconClass}></i></button>
                </div>
                <div id="exContents">
                    <text color='white'>{this.state.server_message}</text>
                </div>
                <div id="exContents">
                    <ExpandedContent expandedContents={this.state.expandedContents}/>
                </div>
            </div>
            <div className="add_content_and_sites_div" style={{backgroundColor:'#0587c3'}}>
                <div className="add_topic_to_topic_div" hidden={!this.state.was_add_topic_button_clicked}>
                    <text style={search_box_textStyle}>הוסף תוכן לנושא: &nbsp;</text><input type="text" value={this.state.add_topic_to_topic_input} onChange={evt => this.add_topic_to_topic_change_function(evt)}/><button id="add_topic_to_topic_button">+</button>
                </div>
                <div className="add_topic_to_topic_div" hidden={!this.state.was_add_topic_button_clicked}>
                    <button onClick= {() => this.add_topic_button_clicked()}>הוסף תוכן לנושא...</button>
                </div>
                <div className="add_site_to_topic_div" hidden={!this.state.was_add_site_button_clicked}>
                    <text style={search_box_textStyle}>הוסף אתר לנושא: &nbsp;</text>

                    <input type="text" value={this.state.add_site_to_topic_input} onChange={evt => this.add_site_to_topic_change_function(evt)}/>
                    <button id="add_site_to_topic_button" onClick={() => this.add_site()}>+</button>
                </div>
                <div className="add_site_to_topic_div" hidden={this.state.was_add_site_button_clicked}>
                    <button onClick= {() => this.add_site_button_clicked()}>הוסף אתר לנושא...</button>
                </div>
            </div>
        <div id="sites">
            <SitesToSearch sitesBeingSearched={this.state.sitesBeingSearched}/>
        </div>
        <div id="refSites">
            <RefSites refSites={this.state.refSites}/>
        </div>
        <div id="ambigous">
            <Ambigous ambigousData={this.state.ambigousData}/>
        </div>    
        </div>
      );

    }
    updateTXT(evt){
        this.setState(
            {
                inputValue: evt.target.value
            }
        );
        this.curSearch=evt.target.value;
    }
    add_site_to_topic_change_function(evt)
    {
        this.setState(
            {
                add_site_to_topic_input: evt.target.value
            }
        );
    }
    add_site_button_clicked()
    {
        this.setState(
            {
                was_add_site_button_clicked: true
            }
        );
    }

    add_site()
    {
        var opts={
            topicName: this.curSearch,
            siteURL: this.state.add_site_to_topic_input
          };
        Axios.post('/api/addContent/addSite', opts, {
        headers: {'findel-auth-token': this.token}}
            ).then(response => {
                this.setState({server_message: response.data});
            }).catch(error=> {
                if (error.response==undefined)
                this.setState({server_message: "אין חיבור לשרת"});
                else
                this.setState({server_message: error.response.data});
        });
    }

    add_topic_to_topic_change_function(evt)
    {
        this.setState(
            {
                add_topic_to_topic_input: evt.target.value
            }
        );
    }
    add_topic_button_clicked()
    {
        this.setState(
            {
                was_add_topic_button_clicked: true
            }
        );
    }

    expandedContentClicked(content)
    {
        this.setState(
            {
                inputValue: content
            });
        this.curSearch=content;
        this.siteSearchFinished=false;
        this.search_button_function_deep_search();
    }

    search_button_function_deep_search= async () => {
        this.did_user_ended_seach=false;
        this.setState({
            search_button_function: () => this.search_button_function_stop_search(),
            simple_search_button_function: ()=> this.search_button_function_stop_search(),
            search_button_text: "סיים חיפוש",
            simple_search_button_text:"סיים חיפוש",
            search_button_iconClass: "fa fa-spinner fa-spin",
            server_message: ""
        });
        this.deep_search();
    }
    simple_search_button_function= async () => {
        this.did_user_ended_seach=true;
        this.setState({
            search_button_function: () => this.search_button_function_stop_search(),
            simple_search_button_function: ()=> this.search_button_function_stop_search(),
            search_button_text: "סיים חיפוש",
            simple_search_button_text:"סיים חיפוש",
            search_button_iconClass: "fa fa-spinner fa-spin",
            server_message: ""
        });
        this.simple_search();
    }

    search_button_function_stop_search= async () => {
        this.did_user_ended_seach=true;
        this.setState({
            search_button_function: () => this.search_button_function_deep_search(),
            simple_search_button_function: () => this.simple_search_button_function(),
            search_button_text: "חפש תכנים",
            simple_search_button_text:"סיים חיפוש",
            search_button_iconClass:""
        });
    }

    async simple_search()
    {
        await search_functions.request_links_and_sites_from_Server(this.curSearch, this);
        var refS=[];
        for (var refSiteIndex=0; refSiteIndex<this.sites_from_server.length; refSiteIndex++)
        {
            refS.push({id: this.id, url: this.sites_from_server[refSiteIndex].url, 
                formatedURL: this.sites_from_server[refSiteIndex].formatedURL,
                siteSnap: this.sites_from_server[refSiteIndex].siteSnap,
                userRankCode: this.sites_from_server[refSiteIndex].userRankCode, 
                edgeWeight: this.sites_from_server[refSiteIndex].edgeWeight, 
                topic: this.curSearch, hits: 0});
            this.id++;
        }
        this.setState({
            refSites: refS
        });
        this.search_button_function_stop_search();
    }

    deep_search= async () => {
        this.setState({
            expandedContents: [],
            refSites: [],
            ambigousData: []
        });
        Axios.get("/api/topicsToTopicsData/?search="+this.curSearch,{
        })
        .then((result) => {
            if (result.data.links!=null)
            {
                this.texts=[];
                search_functions.search_using_wikipedia_links(result.data.links, this);
            }
            else if (result.data.ambig!=null)
            {
                result.data.ambig.forEach(category => {
                    category.id=this.id;
                    this.id++;
                    category.subID=this.id;
                    this.id++;
                    category["subjects"].forEach(subject => {
                        subject.id=this.id;
                        this.id++;
                    });
                });
                this.setState({
                    ambigousData: result.data.ambig
                });
                this.search_button_function_stop_search();
            }
            else
                this.simple_search();
            
        }).catch( (error) => {
            if (error.respnse!=null)
                this.setState({
                    server_message: error.respnse.data
                });
            else
                this.setState({
                    server_message: "בעיה עם חיבור לשרת"
                });
            this.search_button_function_stop_search();
        });
    }
          
}

  export default SearchPage;