import React, { Component } from 'react';
import Domain_component from './Domain_component';
import PropsTypes from 'prop-types';
import './domains.css';
class Domains_component extends Component {
    render() {
        return this.props.domains.map((domain)=>(
            <div className="domains_div">
                <text>{domain.domainURL}: <br/></text>
                אהבו: ({domain.liked_positive_points}) &nbsp;&nbsp;
                לא אהבו: ({domain.liked_negative_points})<br/>
                אמין: ({domain.credibility_positive_points}) &nbsp;&nbsp;
                לא אמין: ({domain.credibility_negative_points}) <br/>
                חינוכי({domain.educational_positive_points})&nbsp;&nbsp;
                לא חינוכי({domain.educational_negative_points})<br/>
                <Domain_component key={domain.id} domain={domain} />
                <button onClick={domain.request_pages_of_domain_function} hidden={domain.is_more_pages_button_hidden}>אתרים...</button>
            </div>
          ));
    }
}
Domains_component.PropsTypes={
    domains: PropsTypes.array.isRequired
} 
export default Domains_component;