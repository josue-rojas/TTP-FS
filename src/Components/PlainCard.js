import React from 'react';
import '../Styles/PlainCard.css';

// a plain old white card wich is styled
export default function PlainCard(props) {
  return(
    <div className={`plain-card ${props.className || ''}`}>
      {props.children}
    </div>
  )
}
