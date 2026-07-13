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
                <img src={education} alt="Învață" />
                <h3>Învață</h3>
            </div>
            <div id='box-2' className='box'>
            <img src={learn} alt="Exerciții" />
                <h3>Exerciții</h3>
            </div>
            <div id='box-3' className='box'>
            <img src={travel} alt="Descoperă" />
                <h3>Descoperă</h3>
            </div>
            <div id='box-4' className='box'>
            <img src={news} alt="Știri" />
                <h3>Știri</h3>
            </div>
        </div>
    )
}


export default Showcase;