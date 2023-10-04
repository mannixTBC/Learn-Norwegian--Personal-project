import React from 'react';
import './showcase.css';
import education from './icons/education.png';
import learn from './icons/learn.jpg';
import news from './icons/news.jpg';
import travel from './icons/travel.jpg';


const Showcase = () => {
    return(
        <div className='showcase-container'>
            <div id='box-1' class='box'>
                <img src={education}/>
                <h3>Learn</h3>
            </div>
            <div id='box-2' class='box'>
            <img src={learn}/>
                <h3>Exercise</h3>
            </div>
            <div id='box-3' class='box'>
            <img src={travel}/>
                <h3>Discover </h3>
            </div>
            <div id='box-4' class='box'>
            <img src={news} />
                <h3>News </h3>
            </div>
        </div>
    )
}


export default Showcase;