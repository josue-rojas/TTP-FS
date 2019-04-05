import React from 'react';
import Button from '../Components/Buttons';
import { withRouter } from "react-router-dom";
import '../Styles/UserPanel.css';
import Logo from './Logo';

// one of the props include the user so we won't have to send another request
class UserPanel extends React.Component {
  constructor(props){
    super(props);
    this.signout = this.signout.bind(this);
  }

  componentDidMount(){
    // try to avoid if somehow user is not sign in and access this page
    // redirect to signin
    if(!this.props.user){
      this.props.history.push('/signin');
      return;
    }
  }

  signout(){
    this.props.firebase.auth()
      .signOut()
      .then(()=> console.log('Sign Out'))
      .catch((error)=> console.log('error signout', error))
  }

  render() {
    if(!this.props.user) return '...'
    return(
      <div className='user-panel panel-content'>
        <Logo/>
        <div className='content-wrapper'>
          Hello {this.props.user.displayName || ''}!
        </div>
        <div className='button-wrapper' id='#signout'>
          <Button
            className='inverse'
            onClick={this.signout}
            text='Sign Out'/>
        </div>
      </div>
    )
  }
}

export default withRouter(UserPanel);
