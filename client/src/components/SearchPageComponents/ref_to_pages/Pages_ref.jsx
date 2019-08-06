import React, { Component } from 'react';
import Page_ref from './Page_ref';
import PropsTypes from 'prop-types';

class Pages_refs extends Component {
    render() {
        
        return this.props.pages_ref.map((page_ref)=>(
            <Page_ref key={page_ref.id} page_ref={page_ref} />
          ));
    }
}
Pages_refs.PropsTypes={
    pages_refs: PropsTypes.array.isRequired
} 
  export default Pages_refs;