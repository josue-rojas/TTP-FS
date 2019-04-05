// takes an array of timers and clears them.
export function clearAllTimeOut(timers){
  for(let i in timers){
    clearTimeout(timers[i]);
  }
}
