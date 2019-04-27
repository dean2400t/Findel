import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import './AAmbigousTitle.css';
class AAmbigousTitle extends Component {
  render() {
    return (
      <div className="title">
      <text><u><b>{this.props.theTitle}</b></u></text>
      </div>
    );
  }
}
AAmbigousTitle.PropsTypes={
    theTitle: PropsTypes.string.isRequired
}   
export default AAmbigousTitle;