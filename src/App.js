import React from 'react';
import './App.css';
import Navbar from './Components/Layout/nav-bar/Navbar';
import Layout from './Components/Layout/front-page/layout';
import Exercitiu from './Components/Exercitii/UI/cardsExercitii';
import Vocabular from './Components/Lectii/UI/cardsLectii';
import Lectia1 from './Components/Lectii/Lectia-1/tabel';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Lectia2 from './Components/Lectii/Lectia-2/tabel';
import Hangman from './Components/Exercitii/Hangman/Hangman';
import Chestionar from './Components/Exercitii/Chestionar/chestionar';
import Wheather from './Components/Weather/weatherCard';
import Dnd from './Components/Exercitii/DragAndDrop/Drag-and-drop/App';
import Footer from './Components/Footer/footer';




function App() {
  return (
    <Router>
    <div className="App">
      <Navbar/>
      <Switch>
      <Route path="/" exact component={Layout}/>
      <Route path="/vocabular" component={Vocabular}/>
      <Route path="/exercitiu" component={Exercitiu}/>
      <Route path="/lectia1" component={Lectia1}/>
      <Route path="/lectia2" component={Lectia2}/>
      <Route path="/hangman" component={Hangman}/>
      <Route path="/chestionar" component={Chestionar}/>
      <Route path="/wheather" component={Wheather}/>
      <Route path="/drag" component={Dnd}/>
      </Switch>
      <Footer/>
      
    </div>
    </Router>
  );
}

export default App;
