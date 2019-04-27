import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from "react-router-dom";

import axios from 'axios';
//import './register.css';

import teacherRegister from './teacherRegister';
import adminRegister from './adminRegister';
import registerPage from './registerPage';


class register extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div className='register'>
      <Router>
        <div>
    
         
          <Link to="/registerPage" style={this.state.displayLoggingComponents}>תלמיד</Link>
          <text style={this.state.displayLoggingComponents}> - </text>
          <Link to="/teacherRegister" style={this.state.displayLoggingComponents}>מורה</Link>
          <text style={this.state.displayLoggingComponents}> - </text>
          <Link to="/adminRegister" style={this.state.displayLoggingComponents}>מנהל</Link>
          
          <hr />

          <Route exact path="/" component={registerPage} />
       
          <Route path="/teacherRegister" component={teacherRegister} />
          <Route path="/adminRegister" component={adminRegister} />
          <Route path="/registerPage" component={registerPage} />
        </div>
      </Router>
      </div>
    );
  }
}
export default register;
