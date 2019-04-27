import React, { Component } from 'react';
import ArefSite from './ArefSite';
import PropsTypes from 'prop-types';

class RefSites extends Component {
    render() {
        
        return this.props.refSites.map((aRefSite)=>(
            <ArefSite key={aRefSite.id} aRefSite={aRefSite} />
          ));
    }
}
RefSites.PropsTypes={
    refSites: PropsTypes.array.isRequired
} 
  export default RefSites;