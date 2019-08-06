import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import './Search.css';
class Search extends Component {
  render() {
    return (
      <div className="search">
        <text> נושא: <a target="_blank" rel="noopener noreferrer" href={'/?search=' + this.props.search.topic}>{this.props.search.topic}</a></text>
        <br/><text> תאריך: {this.props.search.searchDate}</text>
        <br/><br/>
      </div>
    );
  }
}
Search.PropsTypes={
    search: PropsTypes.object.isRequired
}   
export default Search;