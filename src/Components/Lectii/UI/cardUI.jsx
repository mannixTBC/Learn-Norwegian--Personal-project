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
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut officia nam, eius unde suscipit nostrum deserunt? Aliquid rerum earum velit.
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