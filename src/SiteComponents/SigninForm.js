import React from 'react';
import { TextInputWithTooltip } from '../Components/Inputs';
import { ButtonwLoader } from '../Components/Buttons';
import { Link } from "react-router-dom";
import { hasInput, emailCheck } from '../Helpers/InputsCheck';
import { checkAllInputs, onInputChangeTooltip } from '../Helpers/InputFunctions';
import { clearPrevTooltip } from '../Helpers/tooltipHelpers';

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
      previousTooltip: '',
    };
    this.checkInput = {
			email: emailCheck,
      password: hasInput,
		};
    this.signin = this.signin.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.clearTooltipTimer = null;
  }

  componentWillUnmount(){
    clearTimeout(this.clearTooltipTimer);
  }

  signin(){
    let valuesChange = checkAllInputs(this.checkInput, this.state);
    if(valuesChange){
      this.setState(valuesChange);
      return false;
    }
    // clear any tooltips before continuing
    // this.clearAllToolTips(0);
    this.setState({ isLoading: true });
    const thisWrapper = this;
    this.props.firebase.auth()
      .signInWithEmailAndPassword(this.state.email.val, this.state.password.val)
      .catch(function(error){
        thisWrapper.setState({ isLoading: false }, ()=>{
          let newState = thisWrapper.handleFirebaseAuthError(error.code, error.message, thisWrapper.state);
          clearTimeout(thisWrapper.clearTooltipTimer);
          thisWrapper.setState(newState);
          if(newState.previousTooltip){
            clearPrevTooltip(thisWrapper);
          }
        });
      });
  }

  // adds tooltip message to error in their right place
  // returns state with changes
  handleFirebaseAuthError(errorCode, errorMessage, state){
    let copyState = {...state};
    if(copyState.previousTooltip)
      copyState[copyState.previousTooltip].tooltip = '';
    if(errorCode === 'auth/wrong-password'){
      copyState.password.tooltip = errorMessage;
      copyState.previousTooltip = 'password';
    }
    else {
      copyState.email.tooltip = errorMessage;
      copyState.previousTooltip = 'email';
    }
    return copyState;
  }

  onInputChange(e, inputKey){
    onInputChangeTooltip(e, inputKey, this);
  }

  render(){
    return (
      <div style={{position: 'relative'}}>
        <form>
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
          <ButtonwLoader
            inverse={true}
            isLoading={this.state.isLoading}
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
