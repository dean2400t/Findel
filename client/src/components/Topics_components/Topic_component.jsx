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
        var upArrow='black';
        var downArrow='black';
        if (this.props.topic.userRankCode==1)
          upArrow='green';
        if (this.props.topic.userRankCode==2)
          downArrow='red';
        this.state = {
          upArrowColor: upArrow,
          downArrowColor: downArrow,
          rank_error: "",
          edge_weight: this.props.topic.edge_weight,
          rankCode: this.props.topic.userRankCode
        }
        
        this.token=cookies.get('findel-auth-token') || "";
    }
  render() {
    var redText={color: "red"};
    return (
      <div className="topic">
        <text style={{marginRight: '10px'}}>{this.props.topic.connected_topic_name}<br/></text>
        <text style={{marginRight: '10px'}}>דירוג משתמשים: <FontAwesomeIcon icon={faArrowAltCircleUp} color={this.state.upArrowColor} onClick={() => this.upClick()}/> ({this.props.topic.edge_weight}) <FontAwesomeIcon icon={faArrowAltCircleDown} color={this.state.downArrowColor} onClick={() => this.downClick()}/><br/></text>
        <text style={{marginRight: '10px'}}>ציון מחיפוש באתרים: {this.props.topic.web_scrape_score}<br/></text>
        <text style={{marginRight: '10px'}}>חיפוש אחרון: {this.props.topic.last_web_scrape}<br/></text>
        <text style={redText}>{this.state.rank_error}</text>
      </div>
    );
  }
  cancelRank()
  {
    topic_functions.cancelRank(this);
  }

  upClick= () => {
    topic_functions.upClick(this);
  }
  downClick= () => {
    topic_functions.downClick(this);
  }
}
Topic_component.PropsTypes={
    topic: PropsTypes.object.isRequired
}   
export default Topic_component;