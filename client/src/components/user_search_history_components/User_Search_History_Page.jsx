import React, { Component } from 'react';
import Searches from './Searches';
//import './UserSearchHistory.css';
import Cookies from 'universal-cookie';
import axios from 'axios';
const cookies = new Cookies();


class UserSearchHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
          searchHistory:[]
        };
        var token=cookies.get('findel-auth-token') || "";
        axios.get("/api/user_data/search_history",{
          headers: {'findel-auth-token': token}
        })
          .then((result) => {
              return result.data;
          }).then((searchHistory) => {
              
              searchHistory.reverse();
              this.setHistory(searchHistory)
          }).catch((error) => {
              console.log(error);
              var searchHistory=[];
              this.setHistory(searchHistory)
          });
          
        
      }
    setHistory(searchHistory)
    {
      this.setState({
        searchHistory: searchHistory
      });
    }
    render() {
        
      return (
        
        <div>
            <div style={{ backgroundColor:'#0587c3'}}>
            <h1 style={{fontSize:'10', textAlign: 'center', color: 'white'}}>
            היסטורית חיפוש</h1>
        </div>
        <div>
            <Searches searches={this.state.searchHistory}/>
        </div>
        </div>
      );
          
    }
}

  export default UserSearchHistory;