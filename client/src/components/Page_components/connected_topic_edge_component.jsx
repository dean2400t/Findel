import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import Cookies from 'universal-cookie';
import './connected_topic_edge_component.css';
import page_topic_edge_rank_function from './page_topic_edge_rank_function';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleDown} from '@fortawesome/free-solid-svg-icons';

const cookies = new Cookies();
class Connected_topic_edge_component extends Component {
    constructor(props) {
        super(props);
        var liked_upArrow='black';
    var liked_downArrow='black';
    var trustworthy_upArrow='black';
    var trustworthy_downArrow='black';
    var educational_upArrow='black';
    var educational_downArrow='black';

    var users_rankings = this.props.connected_topic_edge.usersRanking
    users_rankings.forEach(ranking => {
        if (ranking.rank_type == "liked")
        {
          if (ranking.rankCode == 1)
            liked_upArrow = 'green'
          else
            liked_downArrow = 'red'
        }

        if (ranking.rank_type == "trustworthy")
        {
          if (ranking.rankCode == 1)
            trustworthy_upArrow = 'green'
          else
            trustworthy_downArrow = 'red'
        }

        if (ranking.rank_type == "educational")
        {
          if (ranking.rankCode == 1)
            educational_upArrow = 'green'
          else
            educational_downArrow = 'red'
        }
      });
    this.state = {
      liked_upArrowColor: liked_upArrow,
      liked_downArrowColor: liked_downArrow,
      trustworthy_upArrowColor: trustworthy_upArrow,
      trustworthy_downArrowColor: trustworthy_downArrow,
      educational_upArrowColor: educational_upArrow,
      educational_downArrowColor: educational_downArrow,
      rank_error: "",
      edge_liked_weight: this.props.connected_topic_edge.liked_weight,
      edge_trustworthy_weight: this.props.connected_topic_edge.trustworthy_weight,
      edge_educational_weight: this.props.connected_topic_edge.educational_weight,
      rankCode: this.props.connected_topic_edge.userRankCode,
    }
    this.last_ranking_timeStamp = null;
    this.last_ranking_id = null;
    this.token=cookies.get('findel-auth-token') || "";
  }
  render() {
    var redText={color: "red"};
    var more_on_page_textStyle={color: '#0587c3'};
    return (
          <div className="connected_topic">
            <a className="topic_link" target="_blank" rel="noopener noreferrer" href={'/?search=' + this.props.connected_topic_edge.topic.topicName}>{this.props.connected_topic_edge.topic.topicName}</a>
            <br/>
            <text>
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.liked_upArrowColor} onClick={() => this.rank_click_up("liked")}/> 
              ({this.state.edge_liked_weight}) 
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.liked_downArrowColor} onClick={() => this.rank_click_down("liked")}/>
              &nbsp; משתמשים שאהבו את הדף בהקשר החיפוש
            </text><br/>
            
            <text> 
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.trustworthy_upArrowColor} onClick={() => this.rank_click_up("trustworthy")}/> 
              ({this.state.edge_trustworthy_weight}) 
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.trustworthy_downArrowColor} onClick={() => this.rank_click_down("trustworthy")}/>
              &nbsp; ציון משתמשים שאמרו שהדף אמין
            </text>
            <br/>
            

            <text>
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.educational_upArrowColor} onClick={() => this.rank_click_up("educational")}/> 
              ({this.state.edge_educational_weight}) 
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.educational_downArrowColor} onClick={() => this.rank_click_down("educational")}/>
              &nbsp; ציון מתשתמשים שאמרו שהדף מכיל תוכן חינוכי 
            </text>
            <br/><text style={redText}>{this.state.rank_error}</text>
            <a target="_blank" rel="noopener noreferrer" href={"/Page_page/"+this.props.connected_topic_edge.page.pageURL}>עוד על הנושא...</a>
          </div>
    );
  }
  rank_click_up(rank_type)
  {
    page_topic_edge_rank_function(this, rank_type, "up")
  }
  rank_click_down(rank_type)
  {
    page_topic_edge_rank_function(this, rank_type, "down")
  }
}
Connected_topic_edge_component.PropsTypes={
    topic: PropsTypes.object.isRequired
}   
export default Connected_topic_edge_component;