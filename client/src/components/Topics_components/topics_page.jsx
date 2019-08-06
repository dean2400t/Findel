import React, { Component } from 'react';
import './topics_page.css'
import axios from 'axios';
import Topics_component from './Topics_component';
import Comments from '../Comments_components/Comments';
import arrange_comments from '../Comments_components/arrange_comments';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

class Topics_page extends Component {
    constructor(props) {
        super(props);
        var topics=[];
        const {topic} = this.props.match.params
        this.state = {
            topics:topics,
            topic: topic,
            add_comment_vars: {
              object_id: "",
              object_id_collection_name: '',
              root_comment_id: null,
              parrent_comments_array: null,
              number_of_overall_comments: 0
            },
            comments:[]
        };
        this.id=1;
        this.token=cookies.get('findel-auth-token') || "";
        axios.get("/api/present_data/connected_topics/?topic="+topic,{
          headers: {'findel-auth-token': this.token}})
          .then((result) => {
              return result.data;
          }).then((data) => {
              data.topics.sort((topic_a, topic_b)=>{return topic_b.web_scrape_score-topic_a.web_scrape_score;})
              data.topics.sort((topic_a, topic_b)=>{return topic_b.liked_weight-topic_a.liked_weight;})
              data.topics.forEach(topic => {
                  topic.id=this.id;
                  this.id++;
              });
              var number_of_overall_comments = data.comments.length;
              data.comments = arrange_comments(data.comments);
              data.add_comment_vars= {
                object_id: data.topic._id,
                object_id_collection_name: 'topics',
                root_comment_id: null,
                parrent_comments_array: data.comments,
                number_of_overall_comments: number_of_overall_comments
                }
                this.setState({
                  comments: data.comments,
                  add_comment_vars: data.add_comment_vars,
                  topics: data.topics
                });
          }).catch((error) => {
              console.log(error);
              var topics=[];
              this.setState({topics: []})
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
                <h3 id="topic_headLine">{this.state.topic}</h3>
                <Comments comments={this.state.comments} parrent_object_data={this.state.add_comment_vars}/> 
                <Topics_component topics={this.state.topics}/>
            </div>
        </div>
      );
          
    }
}

  export default Topics_page;