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

  componentWillReceiveProps(nextProps){
    // clearAllTimeOut(this.timer); //might need this (but works without it...)
    this.setState({
      isExpire: false,
      hide: false,
      message: nextProps.message
    }, ()=>{
      // this should happen after state is change because then hideTooltip won't see the message
      // it might see '' (empty string and not hide it when it changes)
      if(!nextProps.message) return clearAllTimeOut(this.timer);
      this.hideTooltip();
    });
  }

  componentWillUnmount(){
    clearAllTimeOut(this.timer);
  }

  hideTooltip(){
    if(!this.state.message) return '';
    let timerVar = setTimeout(
      () => {
        this.setState({ hide: true });
        let expireTimer = setTimeout(
          () => this.setState({ isExpire: true, message: '' }),
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
