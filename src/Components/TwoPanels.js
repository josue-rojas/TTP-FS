import React from 'react';
import '../Styles/TwoPanels.css';

// just two panels...
// props:
// className: any other extra className
// firstPanel: component for first panel (top in mobile and left in desktop)
// secPanel: second panel component (bottom in mobile and right in desktop)
export default function TwoPanels(props){
  return(
    <div className={`two-panels ${props.className || ''}`}>
      <div className='first-panel panel'>
        {props.firstPanel}
      </div>
      <div className='sec-panel panel'>
        {props.secPanel}
      </div>
    </div>
  )
}
