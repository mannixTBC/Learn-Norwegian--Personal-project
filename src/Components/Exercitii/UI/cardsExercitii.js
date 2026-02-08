import React, { Component } from 'react';
import Card from './cardUI';
import './card-style.css';
import img1 from './icons/hangman_0.png';
import img2 from './icons/chestionar.jpg';
import img3 from './icons/drag.png';
import imgLectii from '../../Lectii/UI/icons/cardimage1.jpg';
import imgChallenge from '../../Layout/front-page/icons/learn.jpg';

class CardsExercitii extends Component {
  render() {
    return (
      <div className="container-fluid d-flex justify-content-center">
        <div className="row">
          <div className="col-md-3 col-6 mb-4">
            <Card
              imgsrc={img1}
              title="Spânzurătoarea"
              path="/hangman"
            />
          </div>
          <div className="col-md-3 col-6 mb-4">
            <Card
              imgsrc={img2}
              title="Chestionar"
              path="/chestionar"
            />
          </div>
          <div className="col-md-3 col-6 mb-4">
            <Card
              imgsrc={img3}
              title="Trage și plasează"
              path="/drag"
            />
          </div>
          <div className="col-md-3 col-6 mb-4">
            <Card
              imgsrc={imgLectii}
              title="Pronunție"
              path="/pronuntie"
            />
          </div>
          <div className="col-md-3 col-6 mb-4">
            <Card
              imgsrc={imgChallenge}
              title="Challenge 30 zile"
              path="/challenge30"
            />
          </div>
          <div className="col-md-3 col-6 mb-4">
            <Card
              imgsrc={imgLectii}
              title="Program norvegiană"
              path="/program-norvegiana"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CardsExercitii;
