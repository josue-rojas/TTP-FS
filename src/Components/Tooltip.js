import React from 'react';
import '../Styles/Tooltip.css';
import { clearAllTimeOut }  from '../Helpers/timerFunctions';

// a tooltip that expires and fades out
export default class Tooltip extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      expireTimer: null,
      isExpire: false,
      hide: false,
      message: '',
    }
    this.timer = [];
    this.hideTooltip = this.hideTooltip.bind(this);
  }

  componentDidMount(){
    this.hideTooltip();
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.message !== this.state.message){
      this.setState({
        isExpire: false,
        hide: false,
        message: nextProps.message
      });
    }
    this.hideTooltip();
  }

  componentWillUnmount(){
    clearAllTimeOut(this.timer);
  }

  hideTooltip(){
    let timerVar = setTimeout(
      ()=> {
        this.setState({ hide: true });
        let expireTimer = setTimeout(
          ()=> this.setState({ isExpire: true, message: '' }),
          200);
        this.timer.push(expireTimer);
      },
      2000);
      this.timer.push(timerVar);
  }


  render(){
    if(this.state.isExpire || !this.state.message) {
      // make sure to clear all timers so it won't glitch
      clearAllTimeOut(this.timer);
      return '';
    }
    return(
      <div className={`tooltip ${this.state.hide ? 'hide': ''}`}>
        <span>{this.state.message}</span>
      </div>
    )
  }

}
