import React, { Component } from 'react';
import axios from 'axios';
import CheckForms from './checkForms';
import 'bootstrap/dist/css/bootstrap.min.css';
import {withRouter, Route, BrowserRouter as Router} from 'react-router-dom';
import Cookies from 'universal-cookie';
import { ENAMETOOLONG } from 'constants';
const cookies = new Cookies();
var checkForms=new CheckForms();

class RegisterPage extends Component {
    constructor(props) {
        super(props);
        this.history=props.history;
        this.state = {
            email: "",
            emailClass: "form-control",
            password: "",
            passwordError:"",
            passwordClass: "form-control",
            serverMessage:"",
            errorClass:"form-control is-invalid",
            successClass: "form-control is-valid",
            userNameClass:"form-control",
            userNameError: "",
            userName:"",
            firstNameClass:"form-control",
            firstNameError: "",
            firstName:"",
            lastNameClass:"form-control",
            lastNameError: "",
            lastName:"",
            emailError:""
        };

        //Check if password was offClicked
        this.passwordBlured=false;
        this.userNameBlured=false;
        this.firstNameBlured=false;
        this.emailBlured=false;
        this.lastNameBlured=false;
        cookies.set('findel-ServerMessage', '', { path: '/' });
        
      }

      nextPath(path) {
        this.props.history.push(path);
      }
    
    render() {
      
      var redText={color: "red"};
      return (
       
        <div className="RegisterPage">
            <h1> הרשמה </h1>
            <text>{this.state.serverMessage}</text>
            <br></br>
            <fieldset id="group1">
              <input type="radio" name="group1" onClick={() => this.position_to_register('student')} value='תלמיד' defaultChecked='true'/> תלמיד &nbsp;&nbsp;
              <input type="radio" name="group1" onClick={() => this.position_to_register('teacher')} value='מורה'/> מורה &nbsp;&nbsp;
              <input type="radio" name="group1" onClick={() => this.position_to_register('admin')} value='מנהל'/> מנהל
            </fieldset>
            <label>
            <input type="text" className={this.state.userNameClass} value={this.state.userName} onChange={event => this.handleUserNameChange(event)} onBlur={event => this.handleUserNameBlur(event) } onKeyPress={this.handleKeyPress} placeholder="כינוי באתר"/>
            <text style={redText}>{this.state.userNameError}</text>
            </label>
            <br></br>
            <label>
            <input type="password" className={this.state.passwordClass} value={this.state.password} onChange={event => this.handlePasswordChange(event)} onBlur={event => this.handlePasswordBlur(event)} onKeyPress={this.handleKeyPress} placeholder="סיסמא"/>
            <text style={redText}>{this.state.passwordError}</text>
            </label>
            <br></br>
            <label>
            <input type="text" className={this.state.emailClass} value={this.state.email} onChange={event => this.handleEmailChange(event)} onBlur={event => this.handleEmailBlur(event)} onKeyPress={this.handleKeyPress} placeholder="אימייל (אופציונאלי)"/>
            <text style={redText}>{this.state.emailError}</text>
            </label>
            <br></br>
            <label>
            <input type="text" className={this.state.firstNameClass} value={this.state.firstName} onChange={event => this.handleFirstNameChange(event)} onBlur={event => this.handleFirstNameBlur(event)} onKeyPress={this.handleKeyPress} placeholder=" שם פרטי"/>
            <text style={redText}>{this.state.firstNameError}</text>
            </label>
            <br></br>
            <label>
            <input type="text" className={this.state.lastNameClass} value={this.state.lastName} onChange={event => this.handleLastNameChange(event)} onBlur={event => this.handleLastNameBlur(event)} onKeyPress={this.handleKeyPress} placeholder=" שם משפחה"/>
            <text style={redText}>{this.state.lastNameError}</text>
            </label>
            <br></br>
            <button name="submitBTN" onClick={() => this.handleSubmit()}>הרשם</button>
        </div>
      );

    }

    position_to_register(pos)
    {
        this.setState(
            {
              position_to_register_val:pos
            }
        )
    }

    handleKeyPress = (event) => {
      if(event.key == 'Enter'){
        this.handleSubmit();
      }
    }

    handleUserNameBlur(event) {
      this.userNameBlured=true;
      this.handleUserNameChange(event);
    }
    
    handleUserNameChange(event) {;
      checkForms.checkUserName(event.target.value, this);
    }

    handleFirstNameBlur(event) {
      this.firstNameBlured=true;
      this.handleFirstNameChange(event);
    }

    handleFirstNameChange(event) {
      checkForms.checkFirstName(event.target.value, this);
    }
    
    handleFirstNameBlur(event) {
      this.firstNameBlured=true;
      this.handleFirstNameChange(event);
    }
    handleLastNameBlur(event) {
      this.lastNameBlured=true;
      this.handleLastNameChange(event);
    }
    handleLastNameChange(event) {
      checkForms.checkLastName(event.target.value, this);
    }
    
    handleEmailChange(event) {
      checkForms.checkEmail(event.target.value, this);
      }
      handleEmailBlur(event) {
        this.emailBlured=true;
        this.handleEmailChange(event);
      }
    handlePasswordBlur(event) {
      this.passwordBlured=true;
      this.handlePasswordChange(event);
      
    }
    handlePasswordChange(event) {
      checkForms.checkPassword(event.target.value, this)
    }
    
    async handleSubmit() {
      this.passwordBlured=true;
      this.userNameBlured=true;
      this.firstNameBlured=true;
      this.emailBlured=true;
      this.lastNameBlured=true;
      var isEmailOK=checkForms.checkEmail(this.state.email, this);
      var isFirstNameOK=checkForms.checkFirstName(this.state.firstName, this);
      var isLastNameOK=checkForms.checkLastName(this.state.lastName, this);
      var isPasswordOK=checkForms.checkPassword(this.state.password, this);
      var isUserNameOK=checkForms.checkUserName(this.state.userName, this);
      if (isEmailOK && isFirstNameOK && isLastNameOK && isPasswordOK && isUserNameOK)
      {
        var dataFromServer;
        var opts={
          email: this.state.email,
          password: this.state.password,
          userName:this.state.userName,
          lastName: this.state.lastName,
          firstName: this.state.firstName
        };
        if (this.state.email=="")
          opts.email=undefined;
        
        if (this.state.position_to_register_val == 'admin')
          var path='/api/users/createAdminAccount';
        else if (this.state.position_to_register_val == 'teacher')
          var path='/api/users/createTeacherAccount';
        else
          var path='/api/users/createStudentAccount';
        var token=cookies.get('findel-auth-token') || "";
        await axios.post(path, opts, 
        {headers: {'findel-auth-token': token}}
            ).then(response => {
              dataFromServer= response.data;
              var token=cookies.get('findel-auth-token') || "";
              if (token!="")
                this.setState({serverMessage: dataFromServer.userName+" המשתמש נרשם בהצלחה"});
              else
              {
                cookies.set('findel-auth-token', dataFromServer.token, { path: '/' });
                this.history.goBack();
              }
              }).catch(error=> {
                if (error.response==undefined)
                  this.setState({serverMessage: "אין חיבור לשרת"});
                else
                  this.setState({serverMessage: error.response.data});
          });
      }
    }
}
export default RegisterPage;