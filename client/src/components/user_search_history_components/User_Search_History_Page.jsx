import React, { Component } from 'react';
import Searches from './Searches';
//import './UserSearchHistory.css';
import Cookies from 'universal-cookie';
import Axios from 'axios';
const cookies = new Cookies();


class UserSearchHistory extends Component {
    constructor(props) {
        super(props);
        var searchHistory=[];
        this.state = {
          SearchHistory:searchHistory
        };
        var token=cookies.get('findel-auth-token') || "";
        Axios.get("/api/userData/searchHistory",{
          headers: {'findel-auth-token': token}
        })
          .then((result) => {
              // Get the result
              // If we want text, call result.text()
              return result.data;
          }).then((searchHistory) => {
              // Do something with the result
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
        SearchHistory:searchHistory
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
            <Searches searches={this.state.SearchHistory}/>
        </div>
        </div>
      );
          
    }
}

  export default UserSearchHistory;