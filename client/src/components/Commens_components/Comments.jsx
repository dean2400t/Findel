import React, { Component } from 'react';
import Acomment from './Comment';
import PropsTypes from 'prop-types';

class Comments extends Component {
    render() {
        
        return this.props.comments.map((comment)=>(
            <Comment key={comment.id} comment={comment} />
          ));
    }
}
Comments.PropsTypes={
    comments: PropsTypes.array.isRequired
} 
  export default RefSites;