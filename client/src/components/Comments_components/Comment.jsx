import React, { Component } from 'react';
import './Comment.css';
import PropsTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowAltCircleUp} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleDown} from '@fortawesome/free-solid-svg-icons';
import Cookies from 'universal-cookie';
import Comments_functions from './comments_functions';
import Add_comment from './add_comment';
import Comments_Array_mapper from './Comments_Array_mapper'; 
import Moment from 'react-moment';

const cookies = new Cookies();
const comments_functions=new Comments_functions();

class Comment extends Component {
  constructor(props) {
    super(props);
    var liked_upArrow='black';
    var liked_downArrow='black';
    if (this.props.comment.rankings)
      this.props.comment.rankings.forEach(ranking => {
          if (ranking.rank_type == "liked")
          {
            if (ranking.rank_code == 1)
              liked_upArrow = 'green'
            else if(ranking.rank_code == 2)
              liked_downArrow = 'red'
          }
        });
    var user_name_color = "#0587c3";
    if (this.props.comment.user.position == "Teacher")
      user_name_color = "green";
    else if (this.props.comment.user.position == "Admin")
      user_name_color = "brown";

    var show_comment_time=false;
    if (this.props.comment.time_made == null)
      show_comment_time=true;
    this.state = {
        liked_upArrowColor: liked_upArrow,
        liked_downArrowColor: liked_downArrow,
        comment: this.props.comment,
        rank_error: "",
        liked_positive_points: this.props.comment.liked_positive_points,
        liked_negative_points: this.props.comment.liked_negative_points,
        add_comment_text: "הגב+",
        is_add_comment_hidden: true,
        add_comment_vars: {
          object_id: this.props.comment._id,
          object_collection_name: 'comments',
          root_comment_id: this.props.comment.root_comment
          },
        user_name_color: user_name_color,
        show_comment_time: show_comment_time
      }
    this.last_ranking_timeStamp = null;
    this.last_ranking_id = null;
    this.token=cookies.get('findel-auth-token') || "";
  }
  render() {
      var add_comment_text_style={cursor: 'pointer'};
      var comment_style={
        "border-right-color": "#0587c3",
        "border-right-style": "double",
        "padding": "5px"
      }
      var user_name_style={
        "color": this.state.user_name_color
      }
      var redText={color: "red"};
      return (
        <div className="Comment" style={comment_style}>
            <text>
              ({this.state.liked_negative_points}) 
              <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.liked_downArrowColor} onClick={() => this.rank_click_down("liked")}/>
              <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.liked_upArrowColor} onClick={() => this.rank_click_up("liked")}/> 
              ({this.state.liked_positive_points}) 
            </text>
            <text style={user_name_style}>&nbsp;&nbsp;{this.state.comment.user.userName}</text>
            <span hidden={this.state.show_comment_time}><br/><text style={user_name_style}>
              הגיב ב: 
              <Moment format="DD/MM/YYYY HH:mm">
                {this.props.comment.time_made}
              </Moment>
              </text></span>
            <br/><text>{this.state.comment.text}</text>
            <br/><text style={redText}>{this.state.rank_error}</text>
            <text onClick= {() => this.add_commnet_text_clicked()} style={add_comment_text_style}>{this.state.add_comment_text}</text>
            <div hidden={this.state.is_add_comment_hidden}>
            <Add_comment parrent_object_data={this.state.add_comment_vars}/>
          </div>
            <Comments_Array_mapper key={this.state.comment.id} comments={this.state.comment.sub_comments}/>
        </div>
      );
    }
    add_commnet_text_clicked()
    {
      if (this.state.is_add_comment_hidden)
        this.setState({
          is_add_comment_hidden: false,
          add_comment_text: "הגב-"
        });
      else
        this.setState({
          is_add_comment_hidden: true,
          add_comment_text: "הגב+"
        });
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
Comment.PropsTypes={
  comment: PropsTypes.object.isRequired
}  
export default Comment;