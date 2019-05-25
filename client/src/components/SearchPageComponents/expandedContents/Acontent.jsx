import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import './Acontent.css';
class Acontent extends Component {
  render() {
    return (
      <span>
        <a className="exContent" target="_blank" rel="noopener noreferrer" href={'/?search=' + this.props.aContent.page}>{this.props.aContent.page}</a><text className="ex_content_partition">{this.props.aContent.partition}</text> 
      </span>
    );
  }
}
Acontent.PropsTypes={
    aContent: PropsTypes.object.isRequired
}   
export default Acontent;