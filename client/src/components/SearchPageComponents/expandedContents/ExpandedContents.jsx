import React, { Component } from 'react';
import Acontent from './Acontent';
import PropsTypes from 'prop-types';

class ExpandedContents extends Component {
    render() {
        
        return this.props.expandedContents.map((aContent)=>(
            <Acontent key={aContent.id} aContent={aContent} />
          ));
    }
}
ExpandedContents.PropsTypes={
    expandedContents: PropsTypes.array.isRequired
} 
  export default ExpandedContents;