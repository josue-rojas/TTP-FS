import React from 'react';
import { TextInputWithTooltip } from '../Components/Inputs';
import Button from '../Components/Buttons';
import Loader from '../Components/Loader';
import { Link } from "react-router-dom";
import { hasInput, emailCheck } from '../Helpers/InputsCheck';
import { checkAllInputs, handleOnChange } from '../Helpers/InputFunctions';
import { clearAllTimeOut }  from '../Helpers/timerFunctions';

export default class SigninForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      email: {
        val: '',
        hasError: false,
        tooltip: '',
      },
      password: {
        val: '',
        hasError: false,
        tooltip: '',
      },
      isLoading: false,
    };
    this.checkInput = {
			email: emailCheck,
      password: hasInput,
		};
    this.tooltipTimers = [];
    this.signin = this.signin.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.clearAllToolTips = this.clearAllToolTips.bind(this);
  }

  componentWillUnmount(){
    clearAllTimeOut(this.tooltipTimers);
  }

  signin(){
    let valuesChange = checkAllInputs(this.checkInput, this.state);
    if(valuesChange){
      this.setState(valuesChange);
      return false;
    }
    // clear any tooltips before continuing
    this.clearAllToolTips(0);
    this.setState({ isLoading: true });
    const thisWrapper = this;
    this.props.firebase.auth()
      .signInWithEmailAndPassword(this.state.email.val, this.state.password.val)
      .catch(function(error){
        thisWrapper.setState({ isLoading: false }, ()=>{
          let newState = thisWrapper.handleFirebaseAuthError(error.code, error.message, thisWrapper.state);
          thisWrapper.setState(newState, ()=>{
            thisWrapper.clearAllToolTips(2300); //ummm. this makes it more confusing
                        // but this is setting up a timer to clear all tooltips so they won't show if there are no error
          });
        });
      });
  }

  // adds tooltip message to error in their right place
  // returns state with changes
  handleFirebaseAuthError(errorCode, errorMessage, state){
    let copyState = {...state};
    if(errorCode === 'auth/wrong-password'){
      copyState.password.tooltip = errorMessage;
    }
    else copyState.email.tooltip = errorMessage;
    return copyState;
  }

  onInputChange(e, inputKey){
    let inputState = handleOnChange(e, inputKey, this.state, this.checkInput);
    this.setState({
      [inputKey]: inputState
    });
  }

  clearAllToolTips(timetoclear){
    // clear tooltips so they won't appear again if there are no errors
    let copyState = { ...this.state };
    let tooltips = ['password', 'email'];
    for(let i in tooltips){
      copyState[tooltips[i]].tooltip = '';
    }
    this.tooltipTimers.push(
      setTimeout(()=>{
        this.setState({ copyState });
      }, timetoclear)
    );
  }

  render(){
    return (
      <div style={{position: 'relative'}}>
        <Loader isLoading={this.state.isLoading}/>
        <form className={this.state.isLoading ? 'inactive': ''}>
          <TextInputWithTooltip
            tooltipMessage={this.state.email.tooltip}
            type='email'
            title='E-MAIL'
            placeholder='Enter your e-mail'
            val={this.state.email.val}
            hasError={this.state.email.hasError}
            onChange={(e) => this.onInputChange(e, 'email')}/>
          <TextInputWithTooltip
            tooltipMessage={this.state.password.tooltip}
            type='password'
            title='PASSWORD'
            placeholder='Enter your password'
            val={this.state.password.val}
            hasError={this.state.password.hasError}
            onChange={(e) => this.onInputChange(e, 'password')}/>
          <Button
            text='Sign In'
            onClick={this.signin}/>
          <div className='extra-link'>
            <Link to='/signup'>
              Not a member?
            </Link>
          </div>
        </form>
      </div>
    );
  }
}
