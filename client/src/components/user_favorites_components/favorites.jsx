import React, { Component } from 'react';
import Topics from './topics';
import PropsTypes from 'prop-types';
import './favorites.css';
class Favorites extends Component {
    render() {
        return this.props.favorites.map((topic)=>(
            <div className="favorites_div">
                <text>{topic.topicName}: <br/></text>
                <Topics key={topic.id} topic={topic} />
            </div>
          ));
    }
}
Favorites.PropsTypes={
    favorites: PropsTypes.array.isRequired
} 
export default Favorites;