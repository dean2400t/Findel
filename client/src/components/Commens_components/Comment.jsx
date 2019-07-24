import React, { Component } from 'react';
import './ArefSite.css';
import PropsTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleDown} from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import Comments_functions from './comments_functions';
import { isArray } from 'util';

const cookies = new Cookies();
const comments_functions=new Comments_functions();

class Comment extends Component {
  constructor(props) {
    super(props);
    if (!isArray(this.props.comment))
    {
    var liked_upArrow='black';
    var liked_downArrow='black';
    var users_rankings = this.props.comment.user_rankings;
    users_rankings.forEach(ranking => {
        if (ranking.rank_type == "liked")
        {
          if (ranking.rankCode == 1)
            liked_upArrow = 'green'
          else if(ranking.rankCode == 2)
            liked_downArrow = 'red'
        }
      });
    this.state = {
        liked_upArrowColor: liked_upArrow,
        liked_downArrowColor: liked_downArrow,
        rank_error: "",
        liked_weight: this.props.comment.liked_weight
      }
    this.last_ranking_timeStamp = null;
    this.last_ranking_id = null;
    this.token=cookies.get('findel-auth-token') || "";
    }
  }
  render() {
    if (isArray(this.props.comment))
      return (
            <Comments key={this.props.comment.id} comments={this.props.comment}/>
      );
    else
      return (
        <div className="Comment">
            <br/>
            <text>
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.liked_upArrowColor} onClick={() => this.rank_click_up("liked")}/> 
              ({this.state.liked_weight}) 
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.liked_downArrowColor} onClick={() => this.rank_click_down("liked")}/>
            </text><br/>
            <br/><text>{this.props.comment.text}</text>
            <br/><text>הגב</text>
          </div>
      );
    }
    rank_click_up(rank_type)
    {
      comments_functions.ranking_function(this, rank_type, "up")
    }
    rank_click_down(rank_type)
    {
      comments_functions.ranking_function(this, rank_type, "down")
    }
}
export default Comment;