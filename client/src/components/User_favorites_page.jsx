import React, { Component } from 'react';
import FavoritesComponent from './user_favorites_components/favorites';
//import './Userfavorites.css';
import Cookies from 'universal-cookie';
import Axios from 'axios';
const cookies = new Cookies();


class UserFavorites extends Component {
    constructor(props) {
        super(props);
        var favorites=[];
        this.state = {
            favorites:favorites
        };
        var token=cookies.get('findel-auth-token') || "";
        Axios.get("/api/userData/favorites",{
          headers: {'findel-auth-token': token}
        })
          .then((result) => {
              // Get the result
              // If we want text, call result.text()
              return result.data;
          }).then((favorites) => {
              // Do something with the result
              var id=1;
              favorites.forEach(topic => {
                topic.id=id;
                id++;
                topic.sites.forEach(site => {
                  site.id=id;
                  id++;
                });
              });
              this.setFavorites(favorites)
          }).catch((error) => {
              console.log(error);
              var favorites=[];
              this.setFavorites(favorites)
          });
          
        
      }
    setFavorites(favorites)
    {
      this.setState({
        favorites:favorites
      });
    }
    render() {
        
      return (
        
        <div>
            <div className="App" style={{ backgroundColor:'#0587c3'}}>
            <h1 style={{fontSize:'10', textAlign: 'center', color: 'white'}}>
            אתרים שדירגתי כטובים</h1>
        </div>
        <div>
            <FavoritesComponent favorites={this.state.favorites}/>
        </div>
        </div>
      );
          
    }
}

  export default UserFavorites;