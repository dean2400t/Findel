import React, { Component } from 'react';
import Pages_in_search from './pages_in_search/Pages_in_search';
import ExpandedContent from './expandedContents/ExpandedContents';
import Pages_ref from './ref_to_pages/Pages_ref';
import Ambigous from './AmbigousContent/Ambigous';
import 'font-awesome/css/font-awesome.min.css';
import './SearchPage.css';
import Cookies from 'universal-cookie';
import main_search_function from './search_process/main_search_function';
import rank_pages from './search_process/rank_pages';
import axios from 'axios';
const cookies = new Cookies();


class SearchPage extends Component {
    constructor(props) {
        super(props);
        this.history=props.history;
        const urlParams = new URLSearchParams(window.location.search);
        const my_search = urlParams.get('search');
        this.curSearch=my_search;

        this.pages_and_texts=[];
        this.pagesFinishedScrape=0;
        this.token=cookies.get('findel-auth-token') || "";
        this.pagesTempState=[];
        this.pageSearchFinished=false;
        this.top_pages=null;

        this.rabinKarp=null;
        this.wikiLinksHashesToWordByLength=[];
        this.wordsMatriciesByLength=[];
        this.id=1;
        
        var search_text_box ='';
        var is_deep_search_needed= false;
        if (this.history.location.state!=undefined)
        {
            var history=this.history.location.state;
            if (history.search_text_box!=null)
                search_text_box= history.search_text_box
        }
        else if (my_search != null)
        {
            search_text_box=my_search;
            is_deep_search_needed= true;
        }
        
        this.pages_from_server_to_use=[];
        this.full_pages_list_from_server=[];
        this.page_displayed_so_far_index=0;
        this.state = {
        search_text_box: search_text_box,
        pages_in_search:[],
        expandedContents: [],
        pages_ref: [],
        ambigousData: [],
        newID: 1,
        search_button_text: "חפש תכנים",
        search_button_iconClass: "",
        server_message:"",
        add_page_to_topic_input:"",
        add_topic_to_topic_input:"",
        add_page_to_topic_description: "",
        was_add_page_button_clicked:false,
        was_add_topic_button_clicked: false,
        is_more_pages_button_hidden: true,
        is_simple_search_selected: false,
        is_show_more_content_hidden: true,
        expandend_content_status: ""
        };
        
        if (search_text_box != '')
            main_search_function(this, is_deep_search_needed);
      }
    render() {
        var search_box_textStyle={color: '#F0F8FF', cursor: 'pointer'};
        var more_content_textStyle={color: '#F0F8FF'};
      return (
        
        <div className="SearchPage">
            <div style={{ backgroundColor:'#0587c3'}}>
                <div className="search_box_div">
                    <img id="findelTheme" src="/publicComponents/findelTheme"/>
                    <div>
                        <input className="text_input" id="search_text_box" type="text" value={this.state.search_text_box} onChange={evt => this.updateTXT(evt)} onKeyPress={this.handleKeyPress}></input>
                        <button id="searchBTN" name="searchBTN" onClick={() => this.search_button_function()}>{this.state.search_button_text} <i className={this.state.search_button_iconClass}></i></button><br/>
                        <input type="radio" onClick={() => this.deep_search_radio_button_clicked()} checked={!this.state.is_simple_search_selected} value=''/> חיפוש עמוק
                        <input type="radio" id="simple_search_radio_button" onClick={() => this.simple_search_radio_button_clicked()} checked={this.state.is_simple_search_selected} value=''/> חיפוש פשוט
                    </div>
                    <div id="exContents">
                        <text color='white'>{this.state.server_message}</text>
                    </div>
                    <div id="exContents">
                        <ExpandedContent expandedContents={this.state.expandedContents}/>
                        <text><i className={this.state.expandend_content_status}></i></text>
                        <a target="_blank" rel="noopener noreferrer" style={more_content_textStyle} href={"/Topic_page/"+this.curSearch} hidden={this.state.is_show_more_content_hidden}>עוד...</a>
                    </div>
                </div>
                <div className="add_content_and_pages_div" style={{backgroundColor:'#0587c3'}}>
                    <div className="add_topic_to_topic_div" hidden={!this.state.was_add_topic_button_clicked}>
                        <text style={search_box_textStyle} onClick= {() => this.add_topic_button_clicked(false)}>-הוסף תוכן לנושא: &nbsp;</text><br/>
                        <input className="text_input" type="text" value={this.state.add_topic_to_topic_input} onChange={evt => this.add_topic_to_topic_change_function(evt)}/>
                        <button id="add_topic_to_topic_button" onClick={() => this.connect_topic()}>+</button>
                    </div>
                    <div className="add_topic_to_topic_div" hidden={this.state.was_add_topic_button_clicked}>
                        <text onClick= {() => this.add_topic_button_clicked(true)} style={search_box_textStyle}>+הוסף תוכן לנושא...</text>
                    </div>
                    <div className="add_page_to_topic_div" hidden={!this.state.was_add_page_button_clicked}>
                        <text onClick= {() => this.add_page_button_clicked(false)} style={search_box_textStyle}>-הוסף אתר לנושא: &nbsp;</text><br/>
                        <input className="text_input" type="text" id="add_page_to_topic_url_input" placeholder=".....//:https" value={this.state.add_page_to_topic_input} onChange={evt => this.add_page_to_topic_change_function(evt)}/><br></br>
                        <textarea className="text_input" value={this.state.add_page_to_topic_description} placeholder="תאור האתר" onChange={evt => this.add_page_to_topic_change_description_function(evt)}/><br/>
                        <button id="add_page_to_topic_button" onClick={() => this.add_page()}>+</button>
                    </div>
                    <div className="add_page_to_topic_div" hidden={this.state.was_add_page_button_clicked}>
                        <text onClick= {() => this.add_page_button_clicked(true)} style={search_box_textStyle}>+הוסף אתר לנושא...</text>
                    </div>
                </div>
            </div>
        <div id="pages_ref">
            <Pages_ref pages_ref={this.state.pages_ref}/>
            <button onClick= {() => this.more_pages_clicked()} hidden={this.state.is_more_pages_button_hidden}>אתרים נוספים...</button>
        </div>
        <div id="pages">
            <Pages_in_search pages_in_search={this.state.pages_in_search}/>
        </div>
        <div id="ambigous">
            <Ambigous ambigousData={this.state.ambigousData}/>
        </div>
        </div>
      );

    }

    handleKeyPress = (event) => {
        if(event.key == 'Enter'){
          this.search_button_function();
        }
      }

    updateTXT(evt){
        this.setState(
            {
                search_text_box: evt.target.value
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

    add_page_to_topic_change_function(evt)
    {
        this.setState(
            {
                add_page_to_topic_input: evt.target.value
            }
        );
    }

    add_page_to_topic_change_description_function(evt)
    {
        this.setState(
            {
                add_page_to_topic_description: evt.target.value
            }
        );
    }

    add_page_button_clicked(hidden_value)
    {
        this.setState(
            {
                was_add_page_button_clicked: hidden_value
            }
        );
    }

    add_page()
    {
        var opts={
            topicName: this.state.search_text_box,
            pageURL: this.state.add_page_to_topic_input,
            pageDescription: this.state.add_page_to_topic_description
          };
        axios.post('/api/addContent/add_page', opts, {
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

    connect_topic()
    {
        var opts={
            current_topicName: this.state.search_text_box,
            new_topicName: this.state.add_topic_to_topic_input
          };
        axios.post('/api/addContent/connect_topic', opts, {
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

    more_pages_clicked(){
        this.pages_from_server_to_use=[];
        var num_of_pages_to_add=10;
        for (var index=this.page_displayed_so_far_index+1; index< this.page_displayed_so_far_index+1+num_of_pages_to_add && index<this.full_pages_list_from_server.length; index++)
            this.pages_from_server_to_use.push(this.full_pages_list_from_server[index]);
        rank_pages(this);
    }

    search_button_function= async () => {
        this.did_user_ended_seach=false;
        this.setState({
            search_button_function: () => this.search_button_function_stop_search(),
            search_button_text: "סיים חיפוש",
            simple_search_button_text:"סיים חיפוש",
            search_button_iconClass: "fa fa-spinner fa-spin",
            is_more_pages_button_hidden: true,
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
            search_button_iconClass:"",
            expandend_content_status: ""
        });
    }

    save_to_history()
    {
        this.history.push({
            pathname: '/',
            search: '?search='+this.state.search_text_box,
            state: {
                search_text_box: this.state.search_text_box
            }
        });
    }

    deep_search= () => {
        this.setState({
            expandedContents: [],
            pages_ref: [],
            ambigousData: []
        });

        if (this.state.is_simple_search_selected)
            var do_deep_search=false;
        else
            var do_deep_search=true;
        main_search_function(this, do_deep_search);
    }
}

  export default SearchPage;