import React from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import Layout from './Components/Layout/layout';
import Exercitiu from './Pages/exercitii';
import Gramatica from './Pages/gramatica';
import Vocabular from './Pages/vocabular';
import Vocabular1 from './Pages/tabel';
import Tabel from './Components/tabel_vocabular/tabel';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Tabel2 from './Components/tabel_vocabular/tabelLectia2';


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
      
      </Switch>
    </div>
    </Router>
  );
}

export default App;
