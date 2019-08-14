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
    var credibility_upArrow='black';
    var credibility_downArrow='black';
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

        if (ranking.rank_type == "credibility")
        {
          if (ranking.rankCode == 1)
            credibility_upArrow = 'green'
          else
            credibility_downArrow = 'red'
        }

        if (ranking.rank_type == "educational")
        {
          if (ranking.rankCode == 1)
            educational_upArrow = 'green'
          else
            educational_downArrow = 'red'
        }
      });
    var jaccard_similarity = null;
    var is_jaccard_hidden = true;
    if (this.props.connected_topic_edge.jaccard_similarity != null)
    {
      jaccard_similarity = this.props.connected_topic_edge.jaccard_similarity;
      is_jaccard_hidden = false;
    }

    var num_of_links_in_page = null;
    var is_num_of_links_in_page_hidden = true;
    if (this.props.connected_topic_edge.num_of_links_in_page != null)
    {
      num_of_links_in_page = this.props.connected_topic_edge.num_of_links_in_page;
      is_num_of_links_in_page_hidden = false;
    }
    this.state = {
      edgeID: this.props.connected_topic_edge._id,
      liked_upArrowColor: liked_upArrow,
      liked_downArrowColor: liked_downArrow,
      credibility_upArrowColor: credibility_upArrow,
      credibility_downArrowColor: credibility_downArrow,
      educational_upArrowColor: educational_upArrow,
      educational_downArrowColor: educational_downArrow,
      rank_error: "",
      edge_liked_positive_points: this.props.connected_topic_edge.liked_positive_points,
      edge_liked_negative_points: this.props.connected_topic_edge.liked_negative_points,
      edge_credibility_positive_points: this.props.connected_topic_edge.credibility_positive_points,
      edge_credibility_negative_points: this.props.connected_topic_edge.credibility_negative_points,
      edge_educational_positive_points: this.props.connected_topic_edge.educational_positive_points,
      edge_educational_negative_points: this.props.connected_topic_edge.educational_negative_points,
      rankCode: this.props.connected_topic_edge.userRankCode,
      jaccard_similarity: jaccard_similarity,
      is_jaccard_hidden: is_jaccard_hidden,
      num_of_links_in_page: num_of_links_in_page,
      is_num_of_links_in_page_hidden: is_num_of_links_in_page_hidden
    }
    this.last_ranking_timeStamp = null;
    this.last_ranking_id = null;
    this.token=cookies.get('findel-auth-token') || "";
  }
  render() {
    var redText={color: "red"};
    return (
          <div className="connected_topic">
            <a className="topic_link" target="_blank" rel="noopener noreferrer" href={'/?search=' + this.props.connected_topic_edge.topic.topicName}>{this.props.connected_topic_edge.topic.topicName}</a>
            <br/>
            <text>
              ({this.state.edge_liked_positive_points}) 
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.liked_upArrowColor} onClick={() => this.rank_click_up("liked")}/> 
              
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.liked_downArrowColor} onClick={() => this.rank_click_down("liked")}/>
              ({this.state.edge_liked_negative_points}) 
              &nbsp; ניקוד משתמשים שאמרו שאהבו את הדף
            </text><br/>
            
            <text> 
              ({this.state.edge_credibility_positive_points}) 
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.credibility_upArrowColor} onClick={() => this.rank_click_up("credibility")}/> 
               
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.credibility_downArrowColor} onClick={() => this.rank_click_down("credibility")}/>
              ({this.state.edge_credibility_negative_points})
              &nbsp; ניקוד משתמשים שאמרו שהדף מכיל תוכן אמין
            </text>
            <br/>
            

            <text>
              ({this.state.edge_educational_positive_points}) 
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.educational_upArrowColor} onClick={() => this.rank_click_up("educational")}/> 
              
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.educational_downArrowColor} onClick={() => this.rank_click_down("educational")}/>
              ({this.state.edge_educational_negative_points}) 
              &nbsp; ניקוד משתמשים שאמרו שהדף מכיל תוכן חינוכי
            </text>
            <br/><text style={redText}>{this.state.rank_error}</text>
            <br/>
            <span hidden={this.state.is_jaccard_hidden}>
              <text>דמיון בין עמוד ויקיפדיה לדף: {this.state.jaccard_similarity}</text>
            </span><br/>
            <span hidden={this.state.is_num_of_links_in_page_hidden}>
              <text>מספר לינקים בויקיפדיה המופיעים באתר: {this.state.num_of_links_in_page}</text>
            </span><br/>
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