import React, { Component } from 'react';
import Favorites from './Favorites';
import Cookies from 'universal-cookie';
import axios from 'axios';
const cookies = new Cookies();


class UserFavorites extends Component {
    constructor(props) {
        super(props);
        var favorites=[];
        this.state = {
            favorites:favorites
        };
        var token=cookies.get('findel-auth-token') || "";
        axios.get("/api/user_data/favorites",{
          headers: {'findel-auth-token': token}
        })
          .then((result) => {
              return result.data;
          }).then((favorites) => {
              
              
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
            דפים שדירגתי כטובים</h1>
        </div>
        <div>
            <Favorites favorites={this.state.favorites}/>
        </div>
        </div>
      );
          
    }
}

  export default UserFavorites;