import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import './Acontent.css';
class Acontent extends Component {
  render() {
    var textStyle={color: '#F0F8FF'};
    return (
      <text className="exContent" style={textStyle} onClick={() => this.props.aContent.clicked(this.props.aContent.page)}>{this.props.aContent.page}{this.props.aContent.partition}</text>
    );
  }
}
Acontent.PropsTypes={
    aContent: PropsTypes.object.isRequired
}   
export default Acontent;