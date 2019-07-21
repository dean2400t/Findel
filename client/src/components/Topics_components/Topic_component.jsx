import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import Cookies from 'universal-cookie';
import './Topic_component.css';
import Topic_functions from './topic_functions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleDown} from '@fortawesome/free-solid-svg-icons';

const cookies = new Cookies();
const topic_functions=new Topic_functions();
class Topic_component extends Component {
    constructor(props) {
        super(props);
        var liked_upArrow='black';
        var liked_downArrow='black';
        var user_rankings = this.props.topic.user_rankings
        user_rankings.forEach(ranking => {
        if (ranking.rank_type == "liked")
        {
          if (ranking.rankCode == 1)
            liked_upArrow = 'green'
          else
            liked_downArrow = 'red'
        }
      });
        this.state = {
          liked_upArrowColor: liked_upArrow,
          liked_downArrowColor: liked_downArrow,
          rank_error: "",
          edge_liked_weight: this.props.topic.liked_weight,
          rankCode: this.props.topic.userRankCode
        }
        this.last_ranking_timeStamp = null;
        this.last_ranking_id = null;
        this.token=cookies.get('findel-auth-token') || "";
    }
  render() {
    var redText={color: "red"};
    return (
      <div className="topic">
        <text style={{marginRight: '10px'}}>{this.props.topic.connected_topic_name}<br/></text>
        <text style={{marginRight: '10px'}}>
        דירוג משתמשים: 
        <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.liked_upArrowColor} onClick={() => this.rank_click_up("liked")}/> 
        ({this.state.edge_liked_weight}) 
        <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.liked_downArrowColor} onClick={() => this.rank_click_down("liked")}/>
        <br/></text>
        <text style={{marginRight: '10px'}}>ציון מחיפוש באתרים: {this.props.topic.web_scrape_score}<br/></text>
        <text style={{marginRight: '10px'}}>חיפוש אחרון: {this.props.topic.last_web_scrape}<br/></text>
        <text style={redText}>{this.state.rank_error}</text>
      </div>
    );
  }
  rank_click_up(rank_type)
  {
    topic_functions.ranking_function(this, rank_type, "up")
  }
  rank_click_down(rank_type)
  {
    topic_functions.ranking_function(this, rank_type, "down")
  }
}
Topic_component.PropsTypes={
    topic: PropsTypes.object.isRequired
}   
export default Topic_component;