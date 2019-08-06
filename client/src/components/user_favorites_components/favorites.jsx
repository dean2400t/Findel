import React, { Component } from 'react';
import Pages from './Pages';
import PropsTypes from 'prop-types';
import './Favorites.css';
class Favorites extends Component {
    render() {
        return this.props.favorites.map((favorite)=>(
            <div className="favorites_div">
                <text>{favorite.topic.topicName}: <br/></text>
                <Pages key={favorite.topic._id} pages={favorite.pages} />
            </div>
        ));
    }
}
Favorites.PropsTypes={
    favorites: PropsTypes.array.isRequired
} 
export default Favorites;