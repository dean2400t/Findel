import React, { Component } from 'react';
import PropsTypes from 'prop-types';
class Pages extends Component {
  render() {
    return (
      <div className="fav_page">
       <a target="_blank" rel="noopener noreferrer" href={this.props.page.pageURL}>{this.props.page.pageURL}</a>
      </div>
    );
  }
}
Pages.PropsTypes={
  page: PropsTypes.object.isRequired
}   
export default Pages;