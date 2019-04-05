import React from 'react';
import '../Styles/Loader.css';

export default function Loader(props){
  return(
    <div className={`loader-wrapper ${props.isLoading ? 'active' : ''}`}>
      <div className={`loader ${props.inverse ? 'inverse': ''}`}></div>
    </div>
  )
}
