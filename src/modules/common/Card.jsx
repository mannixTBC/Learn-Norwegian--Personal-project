import React from 'react';
import { Link } from 'react-router-dom';
import './Card.css';

/**
 * Card reutilizabil pentru navigare între secțiuni (exerciții, joburi, descoperă).
 */
const Card = (props) => {
  const content = (
    <>
      <div className="card-edu__img-wrap">
        <img src={props.imgsrc} alt="" className="card-edu__img" />
        <div className="card-edu__badge" aria-hidden="true">📚</div>
      </div>
      <div className="card-edu__body">
        <h3 className="card-edu__title">{props.title}</h3>
        <p className="card-edu__text">
          {props.description || 'Învață norvegiană, exersează vocabularul și pregătește-te pentru Norvegia.'}
        </p>
        {props.path && <span className="card-edu__cta">Începe →</span>}
      </div>
    </>
  );

  if (props.path) {
    return (
      <Link to={props.path} className="card-edu card-edu--link">
        {content}
      </Link>
    );
  }

  return <div className="card-edu">{content}</div>;
};

export default Card;
