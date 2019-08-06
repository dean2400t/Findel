import React, { Component } from 'react';
import PropsTypes from 'prop-types';
//import './Afavorite.css';
class Page_component extends Component {
  render() {
    return (
      <div>
       <a target="_blank" rel="noopener noreferrer" href={this.props.page.pageURL}>{this.props.page.pageFormatedURL}</a><br/>
      </div>
    );
  }
}
Page_component.PropsTypes={
  page: PropsTypes.object.isRequired
}   
export default Page_component;