import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import './Search.css';
class Search extends Component {
  render() {
    return (
      <div className="search">
        <text> נושא: {this.props.search.topic}<br></br>תאריך: {this.props.search.searchDate}<br></br><br></br></text>
      </div>
    );
  }
}
Search.PropsTypes={
    search: PropsTypes.object.isRequired
}   
export default Search;