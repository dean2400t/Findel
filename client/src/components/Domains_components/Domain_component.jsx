import React, { Component } from 'react';
import Site_component from './Site_component';
import PropsTypes from 'prop-types';

class Domain_component extends Component {
    render() {
        
        return this.props.domain.sites.map((site)=>(
            <Site_component key={site.id} site={site} />
          ));
    }
}
Domain_component.PropsTypes={
    domain: PropsTypes.array.isRequired
} 
export default Domain_component;