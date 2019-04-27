import React, { Component } from 'react';
import PropsTypes from 'prop-types';
//import './Afavorite.css';
class Afavorite extends Component {
  render() {
    return (
      <div className="fav_site">
       <a target="_blank" rel="noopener noreferrer" href={this.props.fav_site.siteURL}>{this.props.fav_site.siteURL}</a>
      </div>
    );
  }
}
Afavorite.PropsTypes={
  fav_site: PropsTypes.object.isRequired
}   
export default Afavorite;