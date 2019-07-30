import React, { Component } from 'react';
import { isArray } from 'util';
import Comments_Array_mapper from './Comments_Array_mapper';
import Comment from './Comment';

class Composite extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (isArray(this.props.composite))
      return (
            <Comments_Array_mapper key={this.props.composite.id} comments={this.props.composite}/>
      );
    else
      return (
            <Comment key={this.props.composite.id} comment={this.props.composite}/>
        );
    }
}
export default Composite;