import React, { Component } from 'react';
import Domain_component from './Domain_component';
import PropsTypes from 'prop-types';
import './domains.css';
class Domains_component extends Component {
    render() {
        return this.props.domains.map((domain)=>(
            <div className="domains_div">
                <text>{domain.domainURL}: <br/></text>
                <text>ציון: {domain.score} <br/></text>
                <Domain_component key={domain.id} domain={domain} />
                <button onClick={domain.request_sites_of_domain_function} hidden={domain.is_more_sites_button_hidden}>אתרים...</button>
            </div>
          ));
    }
}
Domains_component.PropsTypes={
    domains: PropsTypes.array.isRequired
} 
export default Domains_component;