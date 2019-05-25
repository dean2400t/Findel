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
import DomainsPage from './components/Domains_components/DomainsPage';
import Topics_page from './components/Topics_components/topics_page';
import Cookies from 'universal-cookie';
import { createBrowserHistory } from 'history';
 
const history = createBrowserHistory();
history.listen((location, action) => {
  console.log(
    `The current URL is ${location.pathname}${location.search}${location.hash}`
  );
  console.log(`The last navigation action was ${action}`);
  window.location= location.pathname + location.search;
});
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
          

          <text text className="link_text" onClick={() => this.push_to_history_and_go('/')}>חפש</text>
          <text className="link_text" style={this.state.displayLoggingComponents} onClick={() => this.push_to_history_and_go('/Login')}> - התחבר</text>
          <text className="link_text" style={this.state.displayRegisterComponents} onClick={() => this.push_to_history_and_go('/Register')}> -  רישום </text>
          <text className="link_text" style={this.state.displayUserDataComponents} onClick={() => this.push_to_history_and_go('/UserSearchHistory')}> - היסטורית חיפוש</text>
          <text className="link_text" style={this.state.displayUserDataComponents} onClick={() => this.push_to_history_and_go('/UserFavorites')}> - אתרים שדירגתי כטובים</text>
          <text className="link_text" onClick={() => this.push_to_history_and_go('/DomainsPage')}> - דומיינים</text>
          <hr />

          <Route exact path="/" component={SearchPage} />
          <Route path="/Login" component={LoginPage} />
          <Route path="/Register" component={RegisterPage} />
          <Route path="/UserSearchHistory" component={UserSearchHistory} />
          <Route path="/UserFavorites" component={UserFavorites} />
          <Route path="/DomainsPage" component={DomainsPage} />
          <Route path="/TopicsPage/:topic" component={Topics_page} />
          
        </div>
      </Router>
      </div>
    );
  }
  push_to_history_and_go(location)
  {
    history.push(location);
    window.location = location;
  }
  logout()
  {
    cookies.set('findel-auth-token', "", { path: '/' });
    cookies.set('findelUserName', "", { path: '/' });
    window.location = "/";
  }
}
export default App;
