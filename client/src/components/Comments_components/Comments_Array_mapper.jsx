import React, { Component } from 'react';
import Composite from './Composite';
import PropsTypes from 'prop-types';

class Comments_Array_mapper extends Component {
    render() {
        
        return this.props.comments.map((composite)=>(
            <Composite key={composite.id} composite={composite} />
          ));
    }
}
Comments_Array_mapper.PropsTypes={
    comments: PropsTypes.array.isRequired
} 
  export default Comments_Array_mapper;