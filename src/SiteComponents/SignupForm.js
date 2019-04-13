import React from 'react';
import { ButtonwLoader } from '../Components/Buttons';
import { CheckBox, TextInputWithTooltip } from '../Components/Inputs';
import { Link } from "react-router-dom";
import { hasInput, emailCheck } from '../Helpers/InputsCheck';
import { clearPrevTooltip } from '../Helpers/tooltipHelpers';
import { checkAllInputs, onInputChangeTooltip } from '../Helpers/InputFunctions';

export default class SignupForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      name: {
        val: '',
        hasError: false,
        tooltip: '',
      },
      password: {
        val: '',
        hasError: false,
        tooltip: '',
      },
      email: {
        val: '',
        hasError: false,
        tooltip: '',
      },
      checkbox: {
        val: false,
        hasError: false
      },
      isLoading: false,
      previousTooltip: '',
    };
    this.checkInput = {
      name: hasInput,
			email: emailCheck,
      password: hasInput,
      checkbox: () => this.state.checkbox.val
		};
    this.onInputChange = this.onInputChange.bind(this);
    this.checkBoxChange = this.checkBoxChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.handleFirebaseAuthError = this.handleFirebaseAuthError.bind(this);
    this.clearTooltipTimer = null;
  }

  componentWillUnmount(){
    clearTimeout(this.clearTooltipTimer);
  }

  onInputChange(e, inputKey){
    onInputChangeTooltip(e, inputKey, this);
  }

  // this one is a bit different than the input change so it has it's own function
  checkBoxChange(){
    const toggleBox = !this.state.checkbox.val;
    this.setState({
      checkbox: {
        val: toggleBox,
        hasError: !toggleBox
      }
    })
  }

  submitForm(){
    let valuesChange = checkAllInputs(this.checkInput, this.state);
    if(valuesChange){
      this.setState(valuesChange);
      return false;
    }
    this.setState({ isLoading: true });
    const thisWrapper = this;
    this.props.firebase.auth()
      .createUserWithEmailAndPassword(this.state.email.val, this.state.password.val)
      .catch(function(error){
        thisWrapper.setState({ isLoading: false }, ()=>{
          let newState = thisWrapper.handleFirebaseAuthError(error.code, error.message, thisWrapper.state);
          clearTimeout(thisWrapper.clearTooltipTimer);
          thisWrapper.setState(newState);
          if(newState.previousTooltip){
            clearPrevTooltip(thisWrapper);
          }
        });
      })
      .then((user_credentials)=>{
        if(user_credentials){
          user_credentials.user.updateProfile({
            displayName: thisWrapper.state.name.val
          });
        }
      })
  }

  // adds tooltip message to error in their right place
  // returns state with changes
  handleFirebaseAuthError(errorCode, errorMessage, state){
    let copyState = {...state};
    if(copyState.previousTooltip)
      copyState[copyState.previousTooltip].tooltip = '';
    if(errorCode === 'auth/weak-password'){
      copyState.password.tooltip = errorMessage;
      copyState.previousTooltip = 'password';
    }
    else {
      copyState.email.tooltip = errorMessage;
      copyState.previousTooltip = 'email';
    }
    return copyState;
  }

  render(){
    return(
      <div style={{position: 'relative'}}>
        <form>
          <TextInputWithTooltip
            tooltipMessage={this.state.name.tooltip}
            title='FULL NAME'
            placeholder='Enter your full name'
            val={this.state.name.val}
            hasError={this.state.name.hasError}
            onChange={(e) => this.onInputChange(e, 'name')}/>
          <TextInputWithTooltip
            tooltipMessage={this.state.password.tooltip}
            type='password'
            title='PASSWORD'
            placeholder='Enter a password'
            val={this.state.password.val}
            hasError={this.state.password.hasError}
            onChange={(e) => this.onInputChange(e, 'password')}/>
          <TextInputWithTooltip
            tooltipMessage={this.state.email.tooltip}
            type='email'
            title='E-MAIL'
            placeholder='Enter your e-mail'
            val={this.state.email.val}
            hasError={this.state.email.hasError}
            onChange={(e) => this.onInputChange(e, 'email')}/>
          <CheckBox
            hasError={this.state.checkbox.hasError}
            isChecked={this.state.checkbox.val}
            onClick={this.checkBoxChange}
            text={<div className='checkbox-text'><span>I agree all statements in <a href='/'>terms and services</a></span></div>}/>
          <ButtonwLoader
            inverse={true}
            isLoading={this.state.isLoading}
            text='Sign Up'
            onClick={this.submitForm}/>
          <div className='extra-link'>
            <Link to='/signin'>
              I'm already a member
            </Link>
          </div>
        </form>
      </div>
    );
  }
}
