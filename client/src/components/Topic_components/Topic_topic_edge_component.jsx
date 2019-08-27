import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import Cookies from 'universal-cookie';
import './Topic_topic_edge_component.css';
import topic_topic_edge_rank_function from './topic_topic_edge_rank_function';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleDown} from '@fortawesome/free-solid-svg-icons';

const cookies = new Cookies();
class Topic_component extends Component {
    constructor(props) {
        super(props);
        var liked_upArrow='black';
        var liked_downArrow='black';
        var rankings = this.props.topic_topic_edge.rankings;
        if (!rankings)
          rankings=[];
        rankings.forEach(ranking => {
        if (ranking.rank_type == "liked")
        {
          if (ranking.rank_code == 1)
            liked_upArrow = 'green'
          else
            liked_downArrow = 'red'
        }
      });
        this.state = {
          liked_upArrowColor: liked_upArrow,
          liked_downArrowColor: liked_downArrow,
          rank_error: "",
          edge_liked_positive_points: this.props.topic_topic_edge.liked_positive_points,
          edge_liked_negative_points: this.props.topic_topic_edge.liked_negative_points,
        }
        this.last_ranking_timeStamp = null;
        this.last_ranking_id = null;
        this.token=cookies.get('findel-auth-token') || "";
    }
  render() {
    var redText={color: "red"};
    return (
      <div className="topic">
        <a target="_blank" rel="noopener noreferrer" href={'/?search=' + this.props.topic_topic_edge.topic.topicName}>
          <text style={{marginRight: '10px'}}>{this.props.topic_topic_edge.topic.topicName}<br/></text>
        </a>
        <text style={{marginRight: '10px'}}>
        
        דירוג משתמשים: 
        ({this.state.edge_liked_negative_points})
        <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.liked_downArrowColor} onClick={() => this.rank_click_down("liked")}/>
        <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.liked_upArrowColor} onClick={() => this.rank_click_up("liked")}/> 
        ({this.state.edge_liked_positive_points})

        <br/></text>
        <text style={{marginRight: '10px'}}>ציון מחיפוש באתרים: {this.props.topic_topic_edge.web_scrape_score}<br/></text>
        <text style={{marginRight: '10px'}}>חיפוש אחרון: {this.props.topic_topic_edge.last_web_scrape}<br/></text>
        <text style={redText}>{this.state.rank_error}</text>
      </div>
    );
  }
  rank_click_up(rank_type)
  {
    topic_topic_edge_rank_function(this, rank_type, "up")
  }
  rank_click_down(rank_type)
  {
    topic_topic_edge_rank_function(this, rank_type, "down")
  }
}
Topic_component.PropsTypes={
    topic: PropsTypes.object.isRequired
}   
export default Topic_component;