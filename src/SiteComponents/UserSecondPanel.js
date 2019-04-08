import React from 'react';
import { ToggleButton } from '../Components/Buttons';
import UserTrade from './UserTrade';
import UserHistory from './UserHistory';
import '../Styles/UserSecondPanel.css';

export default class UserSecondPanel extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      historyPanel: false
    }
    this.toggleForms = this.toggleForms.bind(this);
  }

  toggleForms(){
    this.setState({ historyPanel: !this.state.historyPanel })
  }

  render(){
    return(
      <div className='user-panel user-second-panel panel-content'>
        <div className='top-buttons-wrapper'>
          <ToggleButton
            onClick={this.toggleForms}
            isToggle={this.state.historyPanel}
            firstText='History'
            secText='Trade'/>
        </div>
        <div className='content-wrapper'>
          {this.state.historyPanel ?
            <UserHistory
              user={this.props.user}
              firebase={this.props.firebase}/> :
            <UserTrade/>
          }
        </div>
      </div>
    )
  }
}
