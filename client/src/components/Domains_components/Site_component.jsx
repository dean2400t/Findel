import React, { Component } from 'react';
import PropsTypes from 'prop-types';
//import './Afavorite.css';
class Site_component extends Component {
  render() {
    return (
      <div className="site_component_div">
       <a target="_blank" rel="noopener noreferrer" href={this.props.site.siteURL}>{this.props.site.siteFormatedURL}</a><br/>
      </div>
    );
  }
}
Site_component.PropsTypes={
  site: PropsTypes.object.isRequired
}   
export default Site_component;