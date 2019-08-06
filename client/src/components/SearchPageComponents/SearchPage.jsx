import React, { Component } from 'react';
import Pages_in_search from './pages_in_search/Pages_in_search';
import ExpandedContent from './expandedContents/ExpandedContents';
import Pages_ref from './ref_to_pages/Pages_ref';
import Ambigous from './AmbigousContent/Ambigous';
import 'font-awesome/css/font-awesome.min.css';
import './SearchPage.css';
import Cookies from 'universal-cookie';
import Search_functions from './pages_in_search/search_functions';
import Axios from 'axios';
const cookies = new Cookies();
const search_functions=new Search_functions();


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
        

        if (this.history.location.state!=undefined)
        {
            var history=this.history.location.state;
            if (history.ambigousData==undefined)
                history.ambigousData=[];
            if (history.expandedContents == undefined)
                history.expandedContents=[];
            if (history.pages_ref == undefined)
                history.pages_ref=[];
            this.state={
                    inputValue: history.inputValue,
                    pages_in_search: [],
                    expandedContents: history.expandedContents,
                    pages_ref: history.pages_ref,
                    ambigousData: history.ambigousData,
                    newID: history.newID,
                    search_button_text: "חפש תכנים",
                    search_button_iconClass: "",
                    server_message:"",
                    add_page_to_topic_input: history.add_page_to_topic_input,
                    add_topic_to_topic_input: history.add_topic_to_topic_input,
                    add_page_to_topic_description: history.add_page_to_topic_description,
                    was_add_page_button_clicked: history.was_add_page_button_clicked,
                    was_add_topic_button_clicked: history.was_add_topic_button_clicked,
                    is_more_pages_button_hidden: history.is_more_pages_button_hidden,
                    is_simple_search_selected: history.is_simple_search_selected,
                    is_show_more_content_hidden: history.is_show_more_content_hidden,
                    expandend_content_status: "",
                    page_displayed_so_far_index: history.page_displayed_so_far_index,
                    pages_from_server_to_use: history.pages_from_server_to_use,
                    full_pages_list_from_server: history.full_pages_list_from_server
                    
            }
            this.full_pages_list_from_server = history.full_pages_list_from_server
        }
        else
        {
            this.pages_from_server_to_use=[];
            this.full_pages_list_from_server=[];
            this.page_displayed_so_far_index=0;
            this.state = {
            inputValue: my_search,
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
            if (my_search != null)
                this.search_button_function();
        }
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
                        <input id="search_text_box" type="text" value={this.state.inputValue} onChange={evt => this.updateTXT(evt)} onKeyPress={this.handleKeyPress}></input>
                        <button id="searchBTN" name="searchBTN" onClick={() => this.search_button_function()}>{this.state.search_button_text} <i className={this.state.search_button_iconClass}></i></button><br/>
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
                <div className="add_content_and_pages_div" style={{backgroundColor:'#0587c3'}}>
                    <div className="add_topic_to_topic_div" hidden={!this.state.was_add_topic_button_clicked}>
                        <text style={search_box_textStyle} onClick= {() => this.add_topic_button_clicked(false)}>-הוסף תוכן לנושא: &nbsp;</text><br/>
                        <input type="text" value={this.state.add_topic_to_topic_input} onChange={evt => this.add_topic_to_topic_change_function(evt)}/><button id="add_topic_to_topic_button">+</button>
                    </div>
                    <div className="add_topic_to_topic_div" hidden={this.state.was_add_topic_button_clicked}>
                        <text onClick= {() => this.add_topic_button_clicked(true)} style={search_box_textStyle}>+הוסף תוכן לנושא...</text>
                    </div>
                    <div className="add_page_to_topic_div" hidden={!this.state.was_add_page_button_clicked}>
                        <text onClick= {() => this.add_page_button_clicked(false)} style={search_box_textStyle}>-הוסף אתר לנושא: &nbsp;</text><br/>
                        <input type="text" id="add_page_to_topic_url_input" placeholder=".....//:https" value={this.state.add_page_to_topic_input} onChange={evt => this.add_page_to_topic_change_function(evt)}/><br></br>
                        <textarea value={this.state.add_page_to_topic_description} placeholder="תאור האתר" onChange={evt => this.add_page_to_topic_change_description_function(evt)}/><br/>
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
            topicName: this.state.inputValue,
            pageURL: this.state.add_page_to_topic_input,
            pageDescription: this.state.add_page_to_topic_description
          };
        Axios.post('/api/addContent/add_page', opts, {
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
        search_functions.rank_pages(this);
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
            search: '?search='+this.state.inputValue,
            state: {
                inputValue: this.state.inputValue,
                pages_in_search: this.state.pages_in_search,
                expandedContents: this.expandedCon_to_history,
                pages_ref: this.ref_pages_for_histoty,
                ambigousData: this.ambig_for_history,
                newID: this.state.newID,
                search_button_text: "חפש תכנים",
                search_button_iconClass: "",
                server_message:"",
                add_page_to_topic_input: this.state.add_page_to_topic_input,
                add_topic_to_topic_input: this.state.add_topic_to_topic_input,
                add_page_to_topic_description: this.state.add_page_to_topic_description,
                was_add_page_button_clicked: this.state.was_add_page_button_clicked,
                was_add_topic_button_clicked: this.state.was_add_topic_button_clicked,
                is_more_pages_button_hidden: this.state.is_more_pages_button_hidden,
                is_simple_search_selected: this.state.is_simple_search_selected,
                is_show_more_content_hidden: this.state.is_show_more_content_hidden,
                expandend_content_status: "",
                page_displayed_so_far_index: this.page_displayed_so_far_index,
                pages_from_server_to_use:this.pages_from_server_to_use,
                full_pages_list_from_server: this.full_pages_list_from_server
            }
        });
    }

    deep_search= () => {
        this.setState({
            expandedContents: [],
            pages_ref: [],
            ambigousData: []
        });
        Axios.get("/api/topics_to_topics_data/?search="+this.curSearch,{
                headers: {'findel-auth-token': this.token}
        })
        .then(async(result) => {
            if (result.data.wikiText!=null && this.state.is_simple_search_selected==false)
            {
                    this.connected_topics_edges=result.data.connected_topics_edges;
                await search_functions.search_using_wikipedia(result.data.wikiText, this);
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
                this.ambig_for_history=result.data.ambig;
                this.search_button_function_stop_search();
            }
            else
            {
                this.connected_topics_edges=result.data.connected_topics_edges;
                await search_functions.request_pages_from_Server_to_use(this.curSearch, this);
                await search_functions.rankpages(this);
                await search_functions.display_expended_content(this);
                this.search_button_function_stop_search();
                this.save_to_history();
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