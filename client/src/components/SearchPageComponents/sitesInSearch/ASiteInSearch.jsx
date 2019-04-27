import React, { Component } from 'react';
import './ASiteInSearch.css';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropsTypes from 'prop-types';
import 'font-awesome/css/font-awesome.min.css';
class ASiteInSearch extends Component {
  render() {
    return (
      <div className="aSiteSR">
          <p>{this.props.aSite.url} <i className={this.props.aSite.scrape}></i><i className={this.props.aSite.hash}></i><i className={this.props.aSite.searched}></i></p>
      </div>
    );
  }
}
ASiteInSearch.PropsTypes={
  aSite: PropsTypes.object.isRequired
}   
export default ASiteInSearch;