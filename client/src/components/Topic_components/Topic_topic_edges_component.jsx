import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import Topic_topic_edge_component from './Topic_topic_edge_component';

class Topics_topic_edges_component extends Component {
    render() {
        return this.props.topic_topic_edges.map((topic_topic_edge)=>(
            <Topic_topic_edge_component key={topic_topic_edge.id} topic_topic_edge={topic_topic_edge}/>
          ));
        }
}
Topics_topic_edges_component.PropsTypes={
    topic_topic_edges: PropsTypes.array.isRequired
} 
  export default Topics_topic_edges_component;