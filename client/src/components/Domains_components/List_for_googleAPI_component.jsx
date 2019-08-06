import React, { Component } from 'react';
import Domain_component from './Domain_component';
import PropsTypes from 'prop-types';
import './List_for_googleAPI_component.css';
class List_for_googleAPI_component extends Component {
    render() {
        return this.props.domains_list.map((domain)=>(
            <div className="list_div">
                <text>{domain.domainURL}: <br/></text>
            </div>
          ));
    }
}
List_for_googleAPI_component.PropsTypes={
    domains_list: PropsTypes.array.isRequired
} 
export default List_for_googleAPI_component;