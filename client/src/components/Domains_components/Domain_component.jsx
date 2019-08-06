import React, { Component } from 'react';
import Page_component from './Page_component';
import PropsTypes from 'prop-types';

class Domain_component extends Component {
    render() {
        
        return this.props.domain.pages.map((page)=>(
            <Page_component key={page.id} page={page} />
          ));
    }
}
Domain_component.PropsTypes={
    domain: PropsTypes.array.isRequired
} 
export default Domain_component;