import React, { Component } from 'react';
import Moment from 'react-moment';
import PropsTypes from 'prop-types';
import './Search.css';
class Search extends Component {
  render() {
    return (
      <div className="search">
        <text> נושא: <a target="_blank" rel="noopener noreferrer" href={'/?search=' + this.props.search.topic.topicName}>{this.props.search.topic.topicName}</a></text>
        <br/>
        <text> 
          תאריך: 
          <Moment format="DD/MM/YYYY HH:mm">
            {this.props.search.searchDate}
          </Moment>
        </text>
        <br/><br/>
      </div>
    );
  }
}
Search.PropsTypes={
    search: PropsTypes.object.isRequired
}   
export default Search;