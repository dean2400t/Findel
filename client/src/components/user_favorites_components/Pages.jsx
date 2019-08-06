import React, { Component } from 'react';
import Page from './Page';
import PropsTypes from 'prop-types';

class Pages extends Component {
    render() {
        
        return this.props.pages.map((page)=>(
            <Page key={page._id} page={page} />
          ));
    }
}
Pages.PropsTypes={
    pages: PropsTypes.array.isRequired
} 
export default Pages;