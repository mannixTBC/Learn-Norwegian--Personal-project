import React from 'react';
import {Link} from 'react-router-dom';

import './card-style.css'

const Card = (props)=> {
    return(
       <div className="card text-center">
           <div className="overfloW">
               <img src={props.imgsrc} alt="people" className="card-img-top"/>
           </div>
           <div className="card-body text-dark">
    <h4 className="card-title">{props.title}</h4> 
              <p className="card-text text-secondary">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut officia nam, eius unde suscipit nostrum deserunt? Aliquid rerum earum velit.
              </p>
              <Link to={props.path}>
              <a href="#" className="btn btn-outline-success">Incepe</a>
              </Link>
              
            </div>       
       </div> 
       
    )

}


export default Card;