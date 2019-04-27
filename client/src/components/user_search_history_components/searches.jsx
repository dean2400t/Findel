import React, { Component } from 'react';
import Asearch from './Asearch';
import PropsTypes from 'prop-types';

class Searches extends Component {
    render() {
        
        return this.props.searches.map((aSearch)=>(
            <Asearch key={aSearch.id} aSearch={aSearch} />
          ));
    }
}
Searches.PropsTypes={
    searches: PropsTypes.array.isRequired
} 
  export default Searches;