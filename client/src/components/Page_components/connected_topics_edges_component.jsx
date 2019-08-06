import React, { Component } from 'react';
import PropsTypes from 'prop-types';
import Connected_topic_edge_component from './connected_topic_edge_component';

class Connected_topics_edges_component extends Component {
    render() {
        return this.props.connected_topics_edges.map((connected_topic_edge)=>(
            <Connected_topic_edge_component key={connected_topic_edge.id} connected_topic_edge={connected_topic_edge}/>
          ));
        }
}
Connected_topics_edges_component.PropsTypes={
    topics: PropsTypes.array.isRequired
} 
  export default Connected_topics_edges_component;