import React, { Component } from 'react';
import './site_page.css'
import axios from 'axios';
import Connected_topics_edges_component from './connected_topics_edges_component';
import Add_comment from '../add_comment';
import Comments_Array_mapper from '../Comments_components/Comments_Array_mapper';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

class Site_page extends Component {
    constructor(props) {
        super(props);
        var topics=[];
        const {siteURL} = this.props.match.params;
        var domain= {domainURL: ""};
        this.state = {
            siteID: "",
            topics:topics,
            site: siteURL,
            domain: domain,
            site_topic_edges: [],
            add_comment_vars: {
                object_id: "",
                object_id_collection_name: 'sd',
                root_comment_id: null,
                parent_comment_id: null
            },
            comments:[]
        };
        this.id=1;
        this.token=cookies.get('findel-auth-token') || "";
        axios.get("/api/present_data/site_data/?siteURL="+siteURL,{
          headers: {'findel-auth-token': this.token}})
          .then((result) => {
              // Get the result
              // If we want text, call result.text()
              return result.data;
          }).then((data) => {
              // Do something with the result
              data.site_topic_edges.sort((edge_a, edge_b)=>{return edge_b.web_scrape_score-edge_a.web_scrape_score;});
              data.site_topic_edges.sort((edge_a, edge_b)=>{return edge_b.liked_weight-edge_a.liked_weight;});
              data.site_topic_edges.forEach(edge => {
                  edge.id = this.id;
                  edge.site={ siteURL: data.siteURL }
                  this.id++;
              });
              data.add_comment_vars= {
                object_id: data.siteID,
                object_id_collection_name: 'sites',
                root_comment_id: null,
                parent_comment_id: null
                }
              this.setState(data);
          }).catch((error) => {
              console.log(error);
          });
      }
    render() {
        
      return (
        <div className='site_page'>
            <div className="Site" style={{ backgroundColor:'#0587c3'}}>
                <h1 style={{fontSize:'10', textAlign: 'center', color: 'white', padding: '10px'}}>
                פרטים על האתר</h1>
                
            </div>
            <div>
                <h3 id="site_headLine">{this.state.siteFormatedURL}</h3>
                <text>{this.state.siteSnap}</text>
                <br/>
                <text>ציון אתר: </text>
                <br/>
                <text>Domain: {this.state.domain.domainURL}</text>
                <br/>
                <Comments_Array_mapper comments={this.state.comments}/> 
                <Add_comment parrent_object_data={this.state.add_comment_vars}/>
                <Connected_topics_edges_component connected_topics_edges={this.state.site_topic_edges}/>
            </div>
        </div>
      );
          
    }
}

  export default Site_page;