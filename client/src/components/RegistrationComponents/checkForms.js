class checkForms {
    checkForms(){}
    checkUserName(userName, formsThis)
    {
      var userNameClass=formsThis.state.successClass;
      var userNameError="";
      
      
      //Case of failure
      if (userName.length<2)
      {
        userNameClass=formsThis.state.errorClass;
        userNameError="שם משתמש חייב להיות מעל 2 אותיות";
      }

      //finalize
      
      
      if (userNameError=="")
        formsThis.userNameBlured=true;
      
      if (formsThis.userNameBlured)
        formsThis.setState({userName: userName,
          userNameClass: userNameClass,
          userNameError:userNameError
          });
      else
        formsThis.setState({userName: userName});
      
      if (userNameError=="")
        return true;
      else
        return false;
    }
    checkFirstName(firstName, formsThis)
    {
      var firstNameClass=formsThis.state.successClass;
      var firstNameError="";
      
      if (firstName.length<2)
      {
        firstNameClass=formsThis.state.errorClass;
        firstNameError="שם פרטי חייב להיות שתי אותיות ומעלה";
      }

      for(var chI=0;chI<firstName.length;chI++){
      if ((firstName.charAt(chI)>='0')&&(firstName.charAt(chI)<='9'))
      {
        firstNameClass=formsThis.state.errorClass;
        firstNameError="לא יכולות להיות ספרות בשם";
        break;
      }    if(firstName.length<2){
        firstNameClass=formsThis.state.errorClass;
        firstNameError="שם חייב להכיל לפחות 2 אותיות";
      }
    }
      //finalize
      
      
      if (firstNameError=="")
        formsThis.firstNameBlured=true;
      
      if (formsThis.firstNameBlured)
        formsThis.setState({firstName: firstName,
          firstNameClass: firstNameClass,
          firstNameError: firstNameError
          });
      else
        formsThis.setState({firstName: firstName});
      
      if (firstNameError=="")
        return true;
      else
        return false;
    }
    
    checkLastName(lastName, formsThis)
    {
        var lastNameClass=formsThis.state.successClass;
      var lastNameError="";
      
      if (lastName.length<2)
      {
        lastNameClass=formsThis.state.errorClass;
        lastNameError="שם פרטי חייב להיות שתי אותיות ומעלה";
      }

      for(var chI=0;chI<lastName.length;chI++){
      if ((lastName.charAt(chI)>='0')&&(lastName.charAt(chI)<='9'))
      {
        lastNameClass=formsThis.state.errorClass;
        lastNameError="לא יכולות להיות ספרות בשם";
        break;
      }    if(lastName.length<2){
        lastNameClass=formsThis.state.errorClass;
        lastNameError="שם חייב להכיל לפחות 2 אותיות";
      }
    }
      //finalize
      
      
      if (lastNameError=="")
        formsThis.lastNameBlured=true;
      
      if (formsThis.lastNameBlured)
        formsThis.setState({lastName: lastName,
          lastNameClass: lastNameClass,
          lastNameError: lastNameError
          });
      else
        formsThis.setState({lastName: lastName});
      
      if (lastNameError=="")
        return true;
      else
        return false;
    }

    checkEmail(email, formsThis)
    {
      var emailClass=formsThis.state.successClass;
      var emailError="";
      if (email=="")
      {
        emailClass="form-control";
        emailError="";
      }
      else if (email.length<5)
      {
        emailClass=formsThis.state.errorClass;
        emailError="אימייל חייב להיות 5 אותיות ומעלה";
      }
      else
      {
        var foundShtrude=false;
        var numOfDots=0;
        for (var chIndex=0; chIndex<email.length; chIndex++)
        {
          if (chIndex==0)
          {
            if (!((email.charAt(chIndex)>'A' && email.charAt(chIndex)<'z') || (email.charAt(chIndex)>'0' && email.charAt(chIndex)<'9')))
              {
                emailClass=formsThis.state.errorClass;
                emailError="אות ראשונה חייבת להיות אות או מספר";
                break;
              }
            }
          else
          {
            if (email.charAt(chIndex)=='@')
            {
              if(email.length-chIndex<3){
                emailClass=formsThis.state.errorClass;
                emailError="כתובת מייל לא תקינה";
                break;
              }
              if (foundShtrude==false)
                foundShtrude=true;
              else
              {
                emailClass=formsThis.state.errorClass;
                emailError="כתובת מייל לא תקינה";
                break;
              }
            }
            if (email.charAt(chIndex)=='.')
              if(foundShtrude){
                if(email.charAt(chIndex-1)=='@' || email.charAt(chIndex-1)=='.' || chIndex==email.length-1)
                {
                  emailClass=formsThis.state.errorClass;
                  emailError="כתובת מייל לא תקינה";
                  break;
                }
                numOfDots++;
              }
            }
          }
        if (foundShtrude==false || numOfDots>2 || numOfDots==0)
          {
            emailClass=formsThis.state.errorClass;
            emailError="כתובת מייל לא תקינה";
          }
        }
        
        if (emailError=="")
            formsThis.emailBlured=true;
        if (formsThis.emailBlured)
        {
            formsThis.setState({email: email,
            emailClass: emailClass,
            emailError: emailError
        });
        }
      else
        formsThis.setState({email: email});
      if (emailError=="")
        return true;
      else
        return false;
        
    }

    checkPassword(password, formsThis)
    {
        var passClass=formsThis.state.successClass;
      var passError="";
      
      
      //Case of failure
      if (password.length<=5)
      {
        passClass=formsThis.state.errorClass;
        passError="סיסמא חייבת להיות מעל 5 אותיות";
      }

        
      //finalize
      
      
      if (passError=="")
        formsThis.passwordBlured=true;
      
      if (formsThis.passwordBlured)
        formsThis.setState({password: password,
          passwordClass: passClass,
          passwordError:passError
          });
      else
        formsThis.setState({password: password});

      if (passError=="")
        return true;
      else
        return false;
    }
}
export default checkForms;