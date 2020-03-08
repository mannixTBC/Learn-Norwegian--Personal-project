import React from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import Layout from './Components/Layout/layout';
import Exercitiu from './Pages/exercitii';
import Gramatica from './Pages/gramatica';
import Vocabular from './Pages/vocabular';
import Tabel from './Components/tabel_vocabular/tabel';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Tabel2 from './Components/tabel_vocabular/tabelLectia2';
import Hangman from './Components/Hangman/Hangman';
import Chestionar from './Components/Chestionar/chestionar1';
import Wheather from './Components/Weather/weatherCard';


function App() {
  return (
    <Router>
    <div className="App">
      <Navbar/>
      <Switch>
      <Route path="/" exact component={Layout}/>
      <Route path="/vocabular" component={Vocabular}/>
      <Route path="/exercitiu" component={Exercitiu}/>
      <Route path="/gramatica" component={Gramatica}/>
      <Route path="/lectia1" component={Tabel}/>
      <Route path="/lectia2" component={Tabel2}/>
      <Route path="/hangman" component={Hangman}/>
      <Route path="/chestionar" component={Chestionar}/>
      <Route path="/vremea" component={Wheather}/>
      
      </Switch>
    </div>
    </Router>
  );
}

export default App;
