import React, { Component } from 'react';
import './topics_page.css'
import axios from 'axios';
import site_component from './site_component';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

class Topics_page extends Component {
    constructor(props) {
        super(props);
        var topics=[];
        const {siteURL} = this.props.match.params
        this.state = {
            topics:topics,
            site: siteURL
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
              topics.sort((topic_a, topic_b)=>{return topic_b.web_scrape_score-topic_a.web_scrape_score;})
              topics.sort((topic_a, topic_b)=>{return topic_b.liked_weight-topic_a.liked_weight;})
              topics.forEach(topic => {
                  topic.id=this.id;
                  this.id++;
              });
              this.setTopics(topics)
          }).catch((error) => {
              console.log(error);
              var topics=[];
              this.setTopics(topics)
          });
          
        
      }
      setTopics(topics)
    {
      this.setState({
        topics: topics
      });
    }
    render() {
        
      return (
        <div>
            <div className="Topics" style={{ backgroundColor:'#0587c3'}}>
                <h1 style={{fontSize:'10', textAlign: 'center', color: 'white', padding: '10px'}}>
                תכנים קשורים</h1>
            </div>
            <div>
            <h3 id="topic_headLine">{this.state.topic}</h3>
                <Topics_component topics={this.state.topics}/>
            </div>
        </div>
      );
          
    }
}

  export default Topics_page;