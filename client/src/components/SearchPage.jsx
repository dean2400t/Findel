import React, { Component } from 'react';
import {Link} from "react-router-dom";
import SitesToSearch from './SearchPageComponents/sitesInSearch/SitesToSearch';
import ExpandedContent from './SearchPageComponents/expandedContents/ExpandedContents';
import RefSites from './SearchPageComponents/refSites/RefSites';
import Ambigous from './SearchPageComponents/AmbigousContent/Ambigous';
import 'font-awesome/css/font-awesome.min.css';
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
          search_button_function: () => this.search_button_function(),
          search_button_text: "חפש תכנים",
          simple_search_button_text:"חיפוש פשוט",
          search_button_iconClass: "",
          server_message:"",
          add_site_to_topic_input:"",
          add_topic_to_topic_input:"",
          add_site_to_topic_description: "",
          was_add_site_button_clicked:false,
          was_add_topic_button_clicked: false,
          is_more_sites_button_hidden: true,
          is_simple_search_selected: false,
          is_show_more_content_hidden: true,
          expandend_content_status: ""
        };
        this.sites_and_texts=[];
        this.sitesFinishedScrape=0;
        this.sites_from_server_to_use=[];
        this.full_sites_list_from_server=[];
        this.token=cookies.get('findel-auth-token') || "";
        this.sitesTempState=[];
        this.siteSearchFinished=false;
        this.topSites=null;
        this.curSearch=null;

        this.rabinKarp=null;
        this.wikiLinksHashesToWordByLength=[];
        this.wordsMatriciesByLength=[];
        this.id=1;
        this.site_displayed_so_far_index=0;
      }
    render() {
        var search_box_textStyle={color: '#F0F8FF', cursor: 'pointer'};
        var more_content_textStyle={color: '#F0F8FF'};
      return (
        
        <div className="SearchPage">
            <div style={{ backgroundColor:'#0587c3'}}>
                <div className="search_box_div">
                    <img id="findelTheme" src="/publicComponents/findelTheme" height="100" width="400"/>
                    <div>
                        <input id="search_text_box" type="text" value={this.state.inputValue} onChange={evt => this.updateTXT(evt)}></input>
                        <button id="searchBTN" name="searchBTN" onClick={this.state.search_button_function}>{this.state.search_button_text} <i className={this.state.search_button_iconClass}></i></button><br/>
                        <input type="radio" onClick={() => this.deep_search_radio_button_clicked()} checked={!this.state.is_simple_search_selected}/> חיפוש עמוק
                        <input type="radio" id="simple_search_radio_button" onClick={() => this.simple_search_radio_button_clicked()} checked={this.state.is_simple_search_selected}/> חיפוש פשוט
                    </div>
                    <div id="exContents">
                        <text color='white'>{this.state.server_message}</text>
                    </div>
                    <div id="exContents">
                        <ExpandedContent expandedContents={this.state.expandedContents}/>
                        <text><i className={this.state.expandend_content_status}></i></text>
                        <a target="_blank" rel="noopener noreferrer" style={more_content_textStyle} href={"/TopicsPage/"+this.curSearch} hidden={this.state.is_show_more_content_hidden}>עוד...</a>
                    </div>
                </div>
                <div className="add_content_and_sites_div" style={{backgroundColor:'#0587c3'}}>
                    <div className="add_topic_to_topic_div" hidden={!this.state.was_add_topic_button_clicked}>
                        <text style={search_box_textStyle} onClick= {() => this.add_topic_button_clicked(false)}>-הוסף תוכן לנושא: &nbsp;</text><br/>
                        <input type="text" value={this.state.add_topic_to_topic_input} onChange={evt => this.add_topic_to_topic_change_function(evt)}/><button id="add_topic_to_topic_button">+</button>
                    </div>
                    <div className="add_topic_to_topic_div" hidden={this.state.was_add_topic_button_clicked}>
                        <text onClick= {() => this.add_topic_button_clicked(true)} style={search_box_textStyle}>+הוסף תוכן לנושא...</text>
                    </div>
                    <div className="add_site_to_topic_div" hidden={!this.state.was_add_site_button_clicked}>
                        <text onClick= {() => this.add_site_button_clicked(false)} style={search_box_textStyle}>-הוסף אתר לנושא: &nbsp;</text><br/>
                        <input type="text" id="add_site_to_topic_url_input" placeholder=".....//:https" value={this.state.add_site_to_topic_input} onChange={evt => this.add_site_to_topic_change_function(evt)}/><br></br>
                        <textarea value={this.state.add_site_to_topic_description} placeholder="תאור האתר" onChange={evt => this.add_site_to_topic_change_description_function(evt)}/><br/>
                        <button id="add_site_to_topic_button" onClick={() => this.add_site()}>+</button>
                    </div>
                    <div className="add_site_to_topic_div" hidden={this.state.was_add_site_button_clicked}>
                        <text onClick= {() => this.add_site_button_clicked(true)} style={search_box_textStyle}>+הוסף אתר לנושא...</text>
                    </div>
                </div>
            </div>
        <div id="refSites">
            <RefSites refSites={this.state.refSites}/>
            <button onClick= {() => this.more_sites_clicked()} hidden={this.state.is_more_sites_button_hidden}>אתרים נוספים...</button>
        </div>
        <div id="sites">
            <SitesToSearch sitesBeingSearched={this.state.sitesBeingSearched}/>
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

    deep_search_radio_button_clicked()
    {
        this.setState(
            {
                is_simple_search_selected:false
            }
        )
    }
    simple_search_radio_button_clicked()
    {
        this.setState(
            {
                is_simple_search_selected:true
            }
        )
    }

    add_site_to_topic_change_function(evt)
    {
        this.setState(
            {
                add_site_to_topic_input: evt.target.value
            }
        );
    }

    add_site_to_topic_change_description_function(evt)
    {
        this.setState(
            {
                add_site_to_topic_description: evt.target.value
            }
        );
    }

    add_site_button_clicked(hidden_value)
    {
        this.setState(
            {
                was_add_site_button_clicked: hidden_value
            }
        );
    }

    add_site()
    {
        var opts={
            topicName: this.state.inputValue,
            siteURL: this.state.add_site_to_topic_input,
            siteDescription: this.state.add_site_to_topic_description
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
    add_topic_button_clicked(hidden_value)
    {
        this.setState(
            {
                was_add_topic_button_clicked: hidden_value
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
        this.search_button_function();
    }

    more_sites_clicked(){
        this.sites_from_server_to_use=[];
        var num_of_sites_to_add=10;
        for (var index=this.site_displayed_so_far_index+1; index< this.site_displayed_so_far_index+1+num_of_sites_to_add && index<this.full_sites_list_from_server.length; index++)
            this.sites_from_server_to_use.push(this.full_sites_list_from_server[index]);
        search_functions.rankSites(this);
    }

    search_button_function= async () => {
        this.did_user_ended_seach=false;
        this.setState({
            search_button_function: () => this.search_button_function_stop_search(),
            search_button_text: "סיים חיפוש",
            simple_search_button_text:"סיים חיפוש",
            search_button_iconClass: "fa fa-spinner fa-spin",
            is_more_sites_button_hidden: true,
            is_show_more_content_hidden: true,
            expandend_content_status: "fa fa-spinner fa-spin",
            server_message: ""
        });
        this.deep_search();
    }

    search_button_function_stop_search= async () => {
        this.did_user_ended_seach=true;
        this.setState({
            search_button_function: () => this.search_button_function(),
            simple_search_button_function: () => this.simple_search_button_function(),
            search_button_text: "חפש תכנים",
            simple_search_button_text:"סיים חיפוש",
            search_button_iconClass:""
        });
    }

    deep_search= async () => {
        this.setState({
            expandedContents: [],
            refSites: [],
            ambigousData: []
        });
        Axios.get("/api/topicsToTopicsData/?search="+this.curSearch,{
                headers: {'findel-auth-token': this.token}
        })
        .then(async (result) => {
            if (result.data.wikiText!=null && this.state.is_simple_search_selected==false)
            {
                this.connected_topics_edges=result.data.connected_topics_edges;
                search_functions.search_using_wikipedia(result.data.wikiText, this);
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
            {
                this.connected_topics_edges=result.data.connected_topics_edges;
                await search_functions.request_sites_from_Server_to_use(this.curSearch, this);
                await search_functions.rankSites(this);
                await search_functions.display_expended_content(this);
                this.search_button_function_stop_search();
            }
            
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