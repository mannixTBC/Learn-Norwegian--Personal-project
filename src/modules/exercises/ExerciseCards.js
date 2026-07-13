import React, { Component } from 'react';
import Card from '../common/Card';
import '../common/Card.css';
import imgHangman from './icons/hangman_0.png';
import imgChestionar from './icons/chestionar.jpg';
import imgDrag from './icons/drag.png';
import imgPronuntie from '../lessons/ui/icons/cardimage1.jpg';
import imgVerbe from '../layout/Home/icons/learn.jpg';
import imgProgram from '../lessons/ui/icons/cardimage2.jpg';

/**
 * Pagina cu carduri pentru toate exercițiile de învățare a limbii.
 */
class ExerciseCards extends Component {
  render() {
    return (
      <div className="container-fluid d-flex justify-content-center">
        <div className="row cards-exercitii__row">
          <div className="col-md-3 col-6 mb-4">
            <Card imgsrc={imgHangman} title="Spânzurătoarea" path="/hangman" />
          </div>
          <div className="col-md-3 col-6 mb-4">
            <Card imgsrc={imgChestionar} title="Chestionar" path="/chestionar" />
          </div>
          <div className="col-md-3 col-6 mb-4">
            <Card imgsrc={imgDrag} title="Trage și plasează" path="/drag" />
          </div>
          <div className="col-md-3 col-6 mb-4">
            <Card imgsrc={imgPronuntie} title="Pronunție" path="/pronuntie" />
          </div>
          <div className="col-md-3 col-6 mb-4">
            <Card
              imgsrc={imgVerbe}
              title="Învață verbele"
              description="Învață 90 de verbe norvegiene în 30 de zile – exerciții drag-and-drop și completare, progres zilnic."
              path="/challenge30"
            />
          </div>
          <div className="col-md-3 col-6 mb-4">
            <Card imgsrc={imgProgram} title="Program norvegiană" path="/program-norvegiana" />
          </div>
        </div>
      </div>
    );
  }
}

export default ExerciseCards;
