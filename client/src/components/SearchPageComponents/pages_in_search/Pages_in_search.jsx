import React, { Component } from 'react';
import Page_in_search from './Page_in_search';
import PropsTypes from 'prop-types';

class Pages_in_search extends Component {
    render() {
        
        return this.props.pages_in_search.map((page_in_search)=>(
            <Page_in_search key={page_in_search.id} page_in_search={page_in_search} />
          ));
    }
}
Pages_in_search.PropsTypes={
    pages_in_search: PropsTypes.array.isRequired
} 
  export default Pages_in_search;