import React, { Component } from 'react';
import Afavorite from './Afavorite';
import PropsTypes from 'prop-types';

class Topic extends Component {
    render() {
        
        return this.props.topic.sites.map((fav_site)=>(
            <Afavorite key={fav_site.id} fav_site={fav_site} />
          ));
    }
}
Topic.PropsTypes={
    topic: PropsTypes.array.isRequired
} 
export default Topic;