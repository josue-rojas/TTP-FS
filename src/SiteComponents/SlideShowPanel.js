import React from 'react';
import Slides from '../Components/Slides';
// images
import Img1 from '../Images/slideshow_images/img1.svg';
import Img2 from '../Images/slideshow_images/img2.svg';
import Img3 from '../Images/slideshow_images/img3.svg';
import Img4 from '../Images/slideshow_images/img4.svg';
import Img5 from '../Images/slideshow_images/img5.svg';
import Logo from './Logo';
import '../Styles/SlideShowPanel.css';

export default function SlideShowPanel(props){
  return(
    <div className='slideshow-panel panel-content'>
      <Logo/>
      <Slides
        texts={[
          'Create a new account to buy and trade stocks with a simulated $5000 start amount.',
          'Buy and sell stocks at their current price like real life**sortof...',
          'View your history transactions to study your moves!',
          'View your holdings to see your progress and performance.',
          'Simple UI shows visually how you are perfoming.'
        ]}
        timer={8000}
        images={[Img1, Img2, Img3, Img4, Img5]}/>
    </div>
  )
}
