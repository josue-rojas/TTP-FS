import React from 'react';
import Icon from '../Images/logo.svg';
import '../Styles/Logo.css';

export default function Logo(props){
  return(
    <div
      onClick={props.onClick ? props.onClick : ()=> false}
      className='icon'>
      <img src={Icon} alt='ufo-icon'/>
    </div>
  );
}
