import React from 'react';
import '../Styles/Slides.css';

export default class Slides extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      activeIndex: 0,
      animate: true,
      interval: null,
      timeoutAnimation: null,
    }
    this.switchImage = this.switchImage.bind(this);
    this.createDots = this.createDots.bind(this);

  }

  componentDidMount(){
    if(this.props.timer){
      let interval = setInterval(()=>{this.switchImage(this.state.activeIndex+1)}, this.props.timer);
      this.setState({
        interval: interval
      })
    }
    let timeout = setTimeout(()=> this.setState({ animate: false }), 500);
    this.setState({ timeoutAnimation: timeout })
  }

  componentWillUnmount(){
    clearInterval(this.state.interval);
    clearTimeout(this.state.timeoutAnimation);
  }

  switchImage(index){
    clearTimeout(this.state.timeoutAnimation);
    let timeout = setTimeout(()=> this.setState({ animate: false }), 500);
    this.setState({
      activeIndex: index%this.props.images.length,
      animate: true,
      timeoutAnimation: timeout
    })
  }

  createDots(total){
    let dots = [];
    for(let i = 0; i < total; i++){
      let activeClass = this.state.activeIndex === i ? 'active' : ''
      dots.push(
        <div
          key={`dot${i}`}
          onClick={()=> this.switchImage(i)}
          className={`dot ${activeClass}`}>
        </div>
      )
    }
    return dots;
  }

  render(){
    let animateClass = this.state.animate ? 'animate' : ''
    return(
      <div className='slides'>
        <div className={`text-wrapper ${animateClass}`}>
          <span>{this.props.texts[this.state.activeIndex]}</span>
        </div>
        <div className={`slideshow-wrapper ${animateClass}`}>
          <img src={this.props.images[this.state.activeIndex]} alt={this.props.texts[this.state.activeIndex]}/>
        </div>
        <div className='dots-wrapper'>
          {this.createDots(this.props.images.length)}
        </div>
      </div>
    )
  }
}
