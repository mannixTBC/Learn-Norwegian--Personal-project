import React from 'react';
import './App.css';
import Navbar from './Components/Layout/nav-bar/Navbar';
import Layout from './Components/Layout/front-page/layout';
import Exercitiu from './Components/Exercitii/UI/cardsExercitii';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Pronuntie from './Components/Pronuntie/Pronuntie';
import Hangman from './Components/Exercitii/Hangman/Hangman';
import Chestionar from './Components/Exercitii/Chestionar/chestionar';
import Wheather from './Components/Weather/weatherCard';
import News from './Components/News/News';
import Dnd from './Components/Exercitii/DragAndDrop/Drag-and-drop/App';
import Challenge30 from './Components/Exercitii/Challenge30/Challenge30';
import LessonProgram from './Components/Lectii/ProgramNorvegiana/LessonProgram';
import JoburiCards from './Components/Joburi/JoburiCards';
import Acte from './Components/Joburi/Acte';
import CeTrebuieSaStii from './Components/Joburi/CeTrebuieSaStii';
import SistemulNorvegian from './Components/Joburi/SistemulNorvegian';
import CumTeAngajezi from './Components/Joburi/CumTeAngajezi';
import DescoperaCards from './Components/Descopera/DescoperaCards';
import AuroreBoreale from './Components/Descopera/AuroreBoreale';
import Fiorduri from './Components/Descopera/Fiorduri';
import DreptulLaNatura from './Components/Descopera/DreptulLaNatura';
import Traditii from './Components/Descopera/Traditii';
import Footer from './Components/Footer/footer';




function App() {
  return (
    <Router>
    <div className="App">
      <Navbar/>
      <main className="App__main">
      <Switch>
      <Route path="/" exact component={Layout}/>
      <Route path="/descopera" exact component={DescoperaCards}/>
      <Route path="/descopera/aurore-boreale" component={AuroreBoreale}/>
      <Route path="/descopera/fiorduri" component={Fiorduri}/>
      <Route path="/descopera/dreptul-la-natura" component={DreptulLaNatura}/>
      <Route path="/descopera/traditii" component={Traditii}/>
      <Route path="/invata-limba" component={Exercitiu}/>
      <Route path="/pronuntie" component={Pronuntie}/>
      <Route path="/hangman" component={Hangman}/>
      <Route path="/chestionar" component={Chestionar}/>
      <Route path="/joburi" exact component={JoburiCards}/>
      <Route path="/joburi/acte" component={Acte}/>
      <Route path="/joburi/cum-te-angajezi" component={CumTeAngajezi}/>
      <Route path="/joburi/ce-trebuie-sa-stii" component={CeTrebuieSaStii}/>
      <Route path="/joburi/sistemul-norvegian" component={SistemulNorvegian}/>
      <Route path="/wheather" component={Wheather}/>
      <Route path="/news" component={News}/>
      <Route path="/drag" component={Dnd}/>
      <Route path="/challenge30" component={Challenge30}/>
      <Route path="/program-norvegiana" component={LessonProgram}/>
      </Switch>
      </main>
      <Footer/>
      
    </div>
    </Router>
  );
}

export default App;
