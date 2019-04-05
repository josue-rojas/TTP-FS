import React from 'react';
import Icon from '../Images/logo.svg';
import '../Styles/Logo.css';

export default function Logo(props){
  return(
    <div className='icon'>
      <img src={Icon} alt='ufo-icon'/>
    </div>
  );
}
