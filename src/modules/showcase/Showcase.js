import {ui} from '../../languages/messages.js';
import React from 'react';
import './Showcase.css';
import education from './icons/education.png';
import learn from './icons/learn.jpg';
import news from './icons/news.jpg';
import travel from './icons/travel.jpg';


const Showcase = () => {
    return(
        <div className='showcase-container'>
            <div id='box-1' className='box'>
                <img src={education} alt={ui('web_aa2e65a649e96dff')} />
                <h3>{ui('web_aa2e65a649e96dff')}</h3>
            </div>
            <div id='box-2' className='box'>
            <img src={learn} alt={ui('web_88814e05b046f4fa')} />
                <h3>{ui('web_88814e05b046f4fa')}</h3>
            </div>
            <div id='box-3' className='box'>
            <img src={travel} alt={ui('web_2d4bb8c47ae91c77')} />
                <h3>{ui('web_2d4bb8c47ae91c77')}</h3>
            </div>
            <div id='box-4' className='box'>
            <img src={news} alt={ui('ui_739370da1ce6bf30')} />
                <h3>{ui('ui_739370da1ce6bf30')}</h3>
            </div>
        </div>
    )
}


export default Showcase;