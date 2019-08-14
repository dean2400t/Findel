import React, { Component } from 'react';
import Domain_component from './Domain_component';
import PropsTypes from 'prop-types';
import './domains.css';
class Domains_component extends Component {
    render() {
        return this.props.domains.map((domain)=>(
            <div className="domains_div">
                <text>{domain.domainURL}: <br/></text>
                <text>ניקוד מאנשים שאהבו דפים באתר: ({domain.likedֹ_positive_points}) ({domain.likedֹ_negative_points}) <br/></text>
                <text>ניקוד מאנשים שאמרו שהאתר מכיל תכנים אמינים: ({domain.credibilityֹ_positive_points}) ({domain.credibilityֹ_negative_points})<br/></text>
                <text>ניקוד מאנשים שאמרו שהאתר מכיל תכנים חינוכיים: ({domain.educational_positive_points}) ({domain.educational_negative_points})<br/></text>
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