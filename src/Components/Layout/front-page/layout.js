import React from 'react';
import './layout.css';
import education from './icons/education.png';
import learn from './icons/learn.jpg';
import news from './icons/news.jpg';
import travel from './icons/travel.jpg';




const Layout = () => {
    return(
        <div >
            <div className='layout-container'>
                <div  className="imagine">
                    <div className="darkbackground textcenter"> <h1 className="text">Discover Norway:
                        <li>Vocabulary</li>
                        <li>Exercises</li>
                        <li>Travel</li>             
                        </h1></div>
            
                </div >
            </div>

            <div className='showcase-container'>
            <div id='box-1' class='box'>
                <img src={education}/>
                <a>Learn</a>
            </div>
            <div id='box-2' class='box'>
            <img src={learn}/>
                <a>Exercise</a>
            </div>
            <div id='box-3' class='box'>
            <img src={travel}/>
                <a>Discover </a>
            </div>
            <div id='box-4' class='box'>
            <img src={news} />
                <a>News </a>
            </div>
        </div>
        </div>
      
    )
}


export default Layout;