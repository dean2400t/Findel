import React, { Component } from 'react';
import AmbigousSubject from './AAAmbigousSubject';
import PropsTypes from 'prop-types';

class AAmbigousSubjects extends Component {
    render() {
        
        return this.props.theSubjects.map((aData)=>(
                <AmbigousSubject key={aData.id} subject={aData}/>
          ));
          
    }
}
AAmbigousSubjects.PropsTypes={
  theSubjects: PropsTypes.array.isRequired
} 
  export default AAmbigousSubjects;