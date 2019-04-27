import React, { Component } from 'react';
import AambigousTitle from './AAmbigousTitle';
import AmbigousSubjects from './AAmbigousSubjects';
import PropsTypes from 'prop-types';

class Ambigous extends Component {
    render() {
        
        return this.props.ambigousData.map((aData)=>(
            <React.Fragment>
                <AambigousTitle key={aData.id} theTitle={aData.title} />
                <AmbigousSubjects key={aData.subID} theSubjects={aData.subjects}/>
            </React.Fragment>
          ));
          
    }
}
Ambigous.PropsTypes={
    aData: PropsTypes.array.isRequired
} 
  export default Ambigous;