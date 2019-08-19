import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import Cookies from 'universal-cookie';
import './connected_topic_edge_component.css';
import page_topic_edge_rank_function from './page_topic_edge_rank_function';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleDown} from '@fortawesome/free-solid-svg-icons';
import {ProgressBar} from 'react-bootstrap';
import {faHeart} from '@fortawesome/free-regular-svg-icons';
import make_bar_style from '../common_functions/make_bar_style';
const cookies = new Cookies();
class Connected_topic_edge_component extends Component {
    constructor(props) {
      super(props);

    var liked_upArrow='black';
    var liked_downArrow='black';
    var users_rankings = this.props.connected_topic_edge.usersRanking
    if (users_rankings)
      users_rankings.forEach(ranking => {
          if (ranking.rank_type == "liked")
          {
            if (ranking.rankCode == 1)
              liked_upArrow = 'green'
            else
              liked_downArrow = 'red'
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

    var liked_bar_style=make_bar_style(
      this.props.connected_topic_edge.liked_positive_points,
      this.props.connected_topic_edge.liked_negative_points,
      );
    
    

    this.state = {
      edgeID: this.props.connected_topic_edge._id,
      liked_upArrowColor: liked_upArrow,
      liked_downArrowColor: liked_downArrow,
      rank_error: "",
      liked_positive_points: this.props.connected_topic_edge.liked_positive_points,
      liked_negative_points: this.props.connected_topic_edge.liked_negative_points,
      rankCode: this.props.connected_topic_edge.userRankCode,
      jaccard_similarity: jaccard_similarity,
      is_jaccard_hidden: is_jaccard_hidden,
      num_of_links_in_page: num_of_links_in_page,
      is_num_of_links_in_page_hidden: is_num_of_links_in_page_hidden,
      liked_bar_style: liked_bar_style
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
            <table>
              <tr>
              <td>
                  ({this.state.liked_negative_points}) 
                  <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.liked_downArrowColor} onClick={() => this.rank_click_down("liked")}/>
              </td>
              <td width='60%'>
                  <ProgressBar
                  variant={this.state.liked_bar_style[1]}
                  now={this.state.liked_bar_style[0]} />
              </td>
              <td>
                  <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.liked_upArrowColor} onClick={() => this.rank_click_up("liked")}/>
                  ({this.state.liked_positive_points})
                  <FontAwesomeIcon icon={faHeart}/>
              </td>
              </tr>
            </table>
            <text style={redText}>{this.state.rank_error}</text>
            
            <div hidden={this.state.is_jaccard_hidden}>
              <text>דמיון בין עמוד ויקיפדיה לדף: {this.state.jaccard_similarity}</text>
            </div>
            <div hidden={this.state.is_num_of_links_in_page_hidden}>
              <text>מספר לינקים בויקיפדיה המופיעים באתר: {this.state.num_of_links_in_page}</text>
            </div>
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