import React, { Component } from 'react';
import axios from 'axios';
import {withRouter, Route, BrowserRouter as Router} from 'react-router-dom';

import Cookies from 'universal-cookie';
const cookies = new Cookies();

class LoginPage extends Component {
    constructor(props) {
        
        super(props);
        this.history=props.history;
        this.state = {
            userName: "",
            password: "",
            serverMessage:""
        };
        cookies.set('findel-ServerMessage', '', { path: '/' });
        this.attampt=0;
      }
      nextPath(path) {
        this.props.history.push(path);
      }
    render() {
        
      return (
        
        <div className="LoginPage">
            <h1> Login </h1>
            <text>{this.state.serverMessage}</text>
            <br></br>
            <label>
            <input type="text" value={this.state.userName} onChange={event => this.handleUserNameChange(event)} onKeyPress={this.handleKeyPress} placeholder="שם משתמש"/>
            </label>
            <br></br>
            <label>
            <input type="password" value={this.state.password} onChange={event => this.handlePasswordChange(event)} onKeyPress={this.handleKeyPress} placeholder="סיסמא"/>
            </label>
            <br></br>
            <button name="submitBTN" onClick={() => this.handleSubmit()}>התחבר</button>
        </div>
      );

    }

    handleKeyPress = (event) => {
      if(event.key == 'Enter'){
        this.handleSubmit();
      }
    }

    handleUserNameChange(event) {
        this.setState({userName: event.target.value});
      }

      handlePasswordChange(event) {
        this.setState({password: event.target.value});
    }
    async handleSubmit() {
      var dataFromServer;
      var opts={
        userName: this.state.userName,
        password: this.state.password
      };
      await axios.post('/api/auth', opts
          ).then(response => {
            dataFromServer= response.data;
            cookies.set('findel-auth-token', dataFromServer.token, { path: '/' });
            this.history.goBack();
            }).catch(error=> {
              if (error.response==undefined)
                this.setState({serverMessage: "אין חיבור לשרת"});
              else
              {
                this.attampt++;
                this.setState({serverMessage: error.response.data+" נסיון מספר: "+this.attampt});
              }
        });
    }
}
export default LoginPage;