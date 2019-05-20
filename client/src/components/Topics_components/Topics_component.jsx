import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import Topic_component from './Topic_component';

class Topics_component extends Component {
    render() {
        return this.props.topics.map((topic)=>(
            <Topic_component key={topic.id} topic={topic}/>
          ));
        }
}
Topics_component.PropsTypes={
    topics: PropsTypes.array.isRequired
} 
  export default Topics_component;