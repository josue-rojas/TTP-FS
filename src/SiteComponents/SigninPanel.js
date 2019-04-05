import React from 'react';
import { ToggleButton } from '../Components/Buttons';
import SignupForm from './SignupForm';
import SigninForm from './SigninForm';
import '../Styles/SigninPanel.css';
import { Route, Link, withRouter } from "react-router-dom";


class SigninPanel extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isMember: false,
    }
    this.toggleForms = this.toggleForms.bind(this);
  }

  componentDidMount(){
    this.setState({ isMember: this.props.location.pathname === '/signin' });
  }

  // handle route for signin and signup to set correct state
  // this component should only show up in '/signin' and '/signup'
  // so no need to worry about other cases
  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      let isMember = nextProps.location.pathname === '/signin';
      this.setState({ isMember: isMember });
    }
  }

  // use withRouter to get history to change location on toggle
  // note: i do not change state here since it will be change in componentWillReceiveProps
  toggleForms(){
    if(!this.state.isMember){
      this.props.history.push('/signin');
    }
    else this.props.history.push('/signup');
  }

  render(){
    return(
      <div className='signin-panel panel-content'>
        <div className='toggle-wrapper'>
          <ToggleButton
            onClick={this.toggleForms}
            isToggle={this.state.isMember}
            firstText='Sign In'
            secText='Sign Up'/>
        </div>
        <div className='form-wrapper'>
          <div className='title'>
            <Link to='/signin' className={this.state.isMember ? '' : 'notactive'}>Sign In</Link>
             <span className='shadow-text'> &nbsp;Or&nbsp;&nbsp; </span>
            <Link to='/signup' className={this.state.isMember ? 'notactive' : ''}>Sign Up</Link>
          </div>
          <Route path="/signin" component={()=>(<SigninForm firebase={this.props.firebase}/>)} />
          <Route path="/signup" component={()=>(<SignupForm firebase={this.props.firebase}/>)} />
        </div>
      </div>
    )
  }
}

export default withRouter(SigninPanel)
