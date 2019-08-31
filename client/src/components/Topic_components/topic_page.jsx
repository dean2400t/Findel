import React, { Component } from 'react';
import './topic_page.css'
import axios from 'axios';
import Topics_topic_edges_component from './Topic_topic_edges_component';
import Comments_loader from '../Comments_components/Comments_loader';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

class Topics_page extends Component {
    constructor(props) {
        super(props);

        const {topic} = this.props.match.params
        this.state = {
            topic: {
              topic_topic_edges: [],
              data_for_comments: {
                object_id: "",
                object_id_collection_name: '',
                number_of_comments: 0
              }
        }};
        this.id=1;
        this.token=cookies.get('findel-auth-token') || "";
        axios.get("/api/topic_topic_edges/retrieve_topic_and_connected_topics/?topicName="+topic,{
          headers: {'findel-auth-token': this.token}})
          .then((result) => {
              return result.data;
          }).then((topic) => {
              var topic_topic_edges = topic.topic_topic_edges;
              topic_topic_edges.sort((topic_a, topic_b)=>{return topic_b.web_scrape_score-topic_a.web_scrape_score;})
              topic_topic_edges.sort((topic_a, topic_b)=>{return topic_b.liked_positive_points-topic_a.liked_positive_points;})
              topic_topic_edges.forEach(topic => {
                  topic.id=this.id;
                  this.id++;
              });

              topic.data_for_comments={
                object_id: topic._id,
                object_id_collection_name: 'topics',
                number_of_comments: topic.number_of_comments
              }
              
              this.setState({
                topic: topic
              });
          }).catch((error) => {
              console.log(error);
          });
      }
    render() {
        
      return (
        <div className="Topics">
            <div style={{ backgroundColor:'#0587c3'}}>
                <h1 style={{fontSize:'10', textAlign: 'center', color: 'white', padding: '10px'}}>
                תכנים קשורים</h1>
            </div>
            <div>
                <h3 id="topic_headLine">{this.state.topic.topicName}</h3>
                <Comments_loader data_for_comments={this.state.topic.data_for_comments}/> 
                <Topics_topic_edges_component topic_topic_edges={this.state.topic.topic_topic_edges}/>
            </div>
        </div>
      );
          
    }
}

  export default Topics_page;