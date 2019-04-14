import React from 'react';
import '../Styles/Buttons.css';
import { Link } from 'react-router-dom';
import Loader from './Loader';

export default function Button(props){
  return(
    <div
      className={`rg button ${props.className || ''}`}
      onClick={props.onClick}>
      {props.text}
    </div>
  )
}

export function ToggleButton(props){
  return(
    <div
      className={`tgl button ${props.isToggle ? 'on' : 'off'}`}
      onClick={props.onClick}>
      <div className='f-state text'>{props.firstText}</div>
      <div className='s-state text'>{props.secText}</div>
    </div>
  )
}

export function LinkButton(props){
  return (
    <Link
      className='rg button'
      to={props.link}>
      {props.text}
    </Link>
  )
}

export function ButtonwLoader(props){
  return(
    <div
      style={{ position: 'relative' }}
      className={`rg button ${props.className || ''} ${props.isLoading ? 'loading' : ''}`}
      onClick={props.isLoading ? () => false : props.onClick}>
      <Loader
        inverse={props.inverse}
        size='sm'
        isLoading={props.isLoading}/>
      <div className='text-wrapper'>{props.text}</div>
    </div>
  )
}
