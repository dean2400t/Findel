import React, { Component } from 'react';
import './Page_in_search.css';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropsTypes from 'prop-types';
import 'font-awesome/css/font-awesome.min.css';
class Page_in_search extends Component {
  render() {
    return (
      <div className="page_in_seach">
          <p>{this.props.page_in_search.pageURL} <i className={this.props.page_in_search.scrape}></i></p>
      </div>
    );
  }
}
Page_in_search.PropsTypes={
  page_in_search: PropsTypes.object.isRequired
}   
export default Page_in_search;