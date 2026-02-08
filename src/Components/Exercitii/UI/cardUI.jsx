import React from 'react';
import { Link } from 'react-router-dom';
import './card-style.css';

const Card = (props) => {
  const content = (
    <>
      <div className="overfloW">
        <img src={props.imgsrc} alt="" className="card-img-top" />
      </div>
      <div className="card-body text-dark">
        <h4 className="card-title">{props.title}</h4>
        <p className="card-text text-secondary">
          {props.description || 'Învață norvegiana, exersează vocabularul și pregătește-te pentru Norvegia. Ideal pentru românii care doresc să emigreze sau să viziteze.'}
        </p>
      </div>
    </>
  );

  if (props.path) {
    return (
      <Link to={props.path} className="card text-center card--link">
        {content}
      </Link>
    );
  }

  return (
    <div className="card text-center">
      {content}
    </div>
  );
};


export default Card;