import React, { Component } from 'react';
import './Page_page.css'
import axios from 'axios';
import Connected_topics_edges_component from './connected_topics_edges_component';
import Comments from '../Comments_components/Comments';
import arrange_comments from '../Comments_components/arrange_comments';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

class Page_page extends Component {
    constructor(props) {
        super(props);
        var topics=[];
        const {pageURL} = this.props.match.params;
        var domain= {domainURL: ""};
        this.state = {
            pageID: "",
            topics:topics,
            page: pageURL,
            domain: domain,
            page_topic_edges: [],
            add_comment_vars: {
                object_id: "",
                object_id_collection_name: '',
                root_comment_id: null,
                parrent_comments_array: null
            },
            comments:[]
        };
        this.id=1;
        this.token=cookies.get('findel-auth-token') || "";
        axios.get("/api/present_data/page_data/?pageURL="+pageURL,{
          headers: {'findel-auth-token': this.token}})
          .then((result) => {
              // Get the result
              // If we want text, call result.text()
              return result.data;
          }).then((data) => {
              // Do something with the result
              data.page_topic_edges.sort((edge_a, edge_b)=>{return edge_b.web_scrape_score-edge_a.web_scrape_score;});
              data.page_topic_edges.sort((edge_a, edge_b)=>{return edge_b.liked_weight-edge_a.liked_weight;});
              data.page_topic_edges.forEach(edge => {
                  edge.id = this.id;
                  edge.page={ pageURL: data.pageURL }
                  this.id++;
              });
              var number_of_overall_comments = data.comments.length;
              data.comments = arrange_comments(data.comments);
              data.add_comment_vars= {
                object_id: data.pageID,
                object_id_collection_name: 'pages',
                root_comment_id: null,
                parrent_comments_array: data.comments,
                number_of_overall_comments: number_of_overall_comments
                }
              this.setState(data);
          }).catch((error) => {
              console.log(error);
          });
      }
    render() {
        
      return (
        <div className='page_page'>
            <div className="Page" style={{ backgroundColor:'#0587c3'}}>
                <h1 style={{fontSize:'10', textAlign: 'center', color: 'white', padding: '10px'}}>
                פרטים על הדף</h1>
                
            </div>
            <div>
                <h3 id="page_headLine">{this.state.pageFormatedURL}</h3>
                <text>{this.state.pageSnap}</text>
                <br/>
                <text>ציון אתר: </text>
                <br/>
                <text>Domain: {this.state.domain.domainURL}</text>
                <br/>
                <Comments comments={this.state.comments} parrent_object_data={this.state.add_comment_vars}/> 
                <Connected_topics_edges_component connected_topics_edges={this.state.page_topic_edges}/>
            </div>
        </div>
      ); 
    }
}

  export default Page_page;