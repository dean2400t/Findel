import React, { Component } from 'react';
import Comment from './Comment';
import PropsTypes from 'prop-types';

class Comments_Array_mapper extends Component {
    render() {
        
        return this.props.comments.map((comment)=>(
            <Comment key={comment.id} comment={comment} />
          ));
    }
}
Comments_Array_mapper.PropsTypes={
    comments: PropsTypes.array.isRequired
} 
  export default Comments_Array_mapper;