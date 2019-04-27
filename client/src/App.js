import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from "react-router-dom";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { faCheckSquare, faCoffee } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import './App.css';
import SearchPage from './components/SearchPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegistrationComponents/register';
import UserSearchHistory from './components/User_Search_History_Page';
import UserFavorites from './components/User_favorites_page';
import Cookies from 'universal-cookie';
const cookies = new Cookies();
library.add(fab, faCheckSquare, faCoffee);


class App extends Component {
  constructor(props) {
    super(props);
    var userName=cookies.get('findelUserName') || "";
    var userPosition=cookies.get('findelUserPosition') || "";
    var hideLogoutBTN=false;
    var displayLoggingComponents={display: 'none'};
    var displayUserDataComponents={display: 'inline'}
    if (userName=="")
    {
      hideLogoutBTN=true;
      displayLoggingComponents={display: 'inline'};
      displayUserDataComponents={display: 'none'}
    }
    this.state = {
      userName: userName,
      hideLogoutBTN:hideLogoutBTN,
      displayLoggingComponents:displayLoggingComponents,
      displayUserDataComponents:displayUserDataComponents
    };
    if (userName=="")
    {
      var token=cookies.get('findel-auth-token') || "";
      if (token!="")
      {
        var opts={
          headers: {'findel-auth-token': token}
        }
        axios.get('/api/users/me', opts
        ).then(response => {
          userName= response.data.userName;
          userPosition= response.data.position;
          var displayRegisterComponent={display: 'none'};
          displayUserDataComponents={display: 'inline'}
          if (userPosition!="student")
            displayRegisterComponent={display: 'inline'};
          this.setState({
            userName: userName,
            hideLogoutBTN: false,
            displayLoggingComponents:{display: 'none'},
            displayRegisterComponents:displayRegisterComponent,
            displayUserDataComponents:displayUserDataComponents
            });
          cookies.set('findelUserName', userName, { path: '/' });
          cookies.set('findelUserPosition', userPosition, { path: '/' });
          }).catch(function(error) {
            alert(error.data);
          });
      }
    }
  }
  render() {
    return (
      <div className='App'>
      <Router>
        <div>
          <text>שלום {this.state.userName}</text>
          <div className="leftDiv">
          <button className="emptyBTN" name="logoutBTN" onClick={() => this.logout()} hidden={this.state.hideLogoutBTN}>התנתק</button>
          </div>
          <br></br>
          <Link to="/">חפש</Link>
          <text style={this.state.displayLoggingComponents}> - </text>
          <Link to="/Login" style={this.state.displayLoggingComponents}>התחבר</Link>
          <text style={this.state.displayRegisterComponents}> - </text>
          <Link to="/Register" style={this.state.displayRegisterComponents}>רישום</Link>
          <text style={this.state.displayUserDataComponents}> - </text>
          <Link to="/UserSearchHistory" style={this.state.displayUserDataComponents}>היסטורית חיפוש</Link>
          <text style={this.state.displayUserDataComponents}> - </text>
          <Link to="/UserFavorites" style={this.state.displayUserDataComponents}>אתרים שדירגתי כטובים</Link>

          <hr />

          <Route exact path="/" component={SearchPage} />
          <Route path="/Login" component={LoginPage} />
          <Route path="/Register" component={RegisterPage} />
          <Route path="/UserSearchHistory" component={UserSearchHistory} />
          <Route path="/UserFavorites" component={UserFavorites} />
        </div>
      </Router>
      </div>
    );
  }
  logout()
  {
    cookies.set('findel-auth-token', "", { path: '/' });
    cookies.set('findelUserName', "", { path: '/' });
    window.location = "/";
  }
}
export default App;
