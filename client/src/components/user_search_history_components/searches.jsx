import React, { Component } from 'react';
import Search from './Search';
import PropsTypes from 'prop-types';

class Searches extends Component {
    render() {
        
        return this.props.searches.map((search)=>(
            <Search key={search.id} search={search} />
          ));
    }
}
Searches.PropsTypes={
    searches: PropsTypes.array.isRequired
} 
  export default Searches;