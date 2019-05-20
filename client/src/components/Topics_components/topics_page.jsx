import React, { Component } from 'react';
import './topics_page.css'
import axios from 'axios';
import Topics_component from './Topics_component';

class Topics_page extends Component {
    constructor(props) {
        super(props);
        var topics=[];
        const {topic} = this.props.match.params
        this.state = {
            topics:topics,
            topic: topic
        };
        this.id=1;
        axios.get("/api/present_data/connected_topics/?topic="+topic)
          .then((result) => {
              // Get the result
              // If we want text, call result.text()
              return result.data;
          }).then((topics) => {
              // Do something with the result
              topics.sort((topic_a, topic_b)=>{return topic_b.web_scrape_score-topic_a.web_scrape_score;})
              topics.sort((topic_a, topic_b)=>{return topic_b.edge_weight-topic_a.edge_weight;})
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