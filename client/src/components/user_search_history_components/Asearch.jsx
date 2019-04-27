import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import './Asearch.css';
class Asearch extends Component {
  render() {
    return (
      <div className="search">
        <text> נושא: {this.props.aSearch.topic}<br></br>תאריך: {this.props.aSearch.searchDate}<br></br><br></br></text>
      </div>
    );
  }
}
Asearch.PropsTypes={
    aSearch: PropsTypes.object.isRequired
}   
export default Asearch;