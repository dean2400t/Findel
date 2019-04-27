import React, { Component } from 'react';
import ASiteInSearch from './ASiteInSearch';
import PropsTypes from 'prop-types';

class SitesToSearch extends Component {
    render() {
        
        return this.props.sitesBeingSearched.map((aSiteInSearch)=>(
            <ASiteInSearch key={aSiteInSearch.id} aSite={aSiteInSearch} />
          ));
    }
}
SitesToSearch.PropsTypes={
    sitesBeingSearched: PropsTypes.array.isRequired
} 
  export default SitesToSearch;