import React from 'react';
import '../Styles/MenuIcon.css';

export default function MenuIcon(props){
  return(
    <div
      onClick={props.onClick}
      className={`menu-icon ${props.className || ''} ${props.isActive ? 'active' : ''}`}>
      <div className='menu-line'></div>
      <div className='menu-line'></div>
    </div>
  )
}
