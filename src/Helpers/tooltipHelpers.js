// need to pass thisScope (component this)
// then in state mush have previousTooltip and each input should have tooltip

export function clearPrevTooltip(thisScope){
  thisScope.clearTooltipTimer = setTimeout(()=>{
    if(thisScope.state.previousTooltip){
      let previousInputWTooltip = { ...thisScope.state[thisScope.state.previousTooltip] };
      previousInputWTooltip.tooltip = '';
      console.log('gonna clear');
      thisScope.setState({
        [thisScope.state.previousTooltip]: previousInputWTooltip,
        previousTooltip: '',
      })
    }
  }, 2210);
}
