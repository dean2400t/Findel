import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import './AAAmbigousSubject.css';
class AAAmbigousSubject extends Component {
  render() {
    return (
    <div className="subject">
      <text>
      <a target="_blank" rel="noopener noreferrer" href={'/?search=' + this.props.subject.name}>
      {this.props.subject.name}</a>: 
      {this.props.subject.description}</text>
    </div>
    );
  }
}
AAAmbigousSubject.PropsTypes={
    subject: PropsTypes.object.isRequired
}   
export default AAAmbigousSubject;