import React, { Component, useState }  from 'react';


import intrebari from './intrebari.js';
import './chestionar.css';
import Progres from './progres';



class Chestionar extends Component{

    
    constructor(props) {
        super(props);
        
        this.state = {
            
          corecte : 0,
          gresite : 0,
          mistake: 0,
          guessed: new Set([]),
          isActive : false,
          isCorrect: false,
          currentList : intrebari,
          currentQuestion : intrebari[0],
          selectedAnswer : 0
          
        }
        
      }

      x = 0;
      setNextQuestion = () =>{
        if ( this.x === this.state.currentList.length - 1){
            this.x = this.state.currentList.length - 1
            this.setState(st => ({ 
                currentQuestion : st.currentList[this.x]
              }));
        }else{
            this.x = this.x + 1;
            this.setState(st => ({
                currentQuestion : st.currentList[this.x] 
              }));         
                console.log(this.state.x)
                console.log(this.state.currentQuestion)
                }
    }
        
    previosQuestion = () => {
        if ( this.x === 0){
            this.x = 0
            this.setState(st => ({ 
                currentQuestion : st.currentList[this.x]
              }));
        }else{
            this.x = this.x - 1;
            this.setState(st => ({
                currentQuestion : st.currentList[this.x] 
              }));         
                console.log(this.state.x)
                console.log(this.state.currentQuestion)
                }
    }    
    checkState (state){
         console.log(state);
    }
  

    
    saveAnswer (state) {
        if(state === true) {
            this.setState(st => ({
                corecte : st.corecte + 1
              }));
            this.setNextQuestion();
        }else {
            this.setState(st => ({
                gresite : st.gresite + 1
              }));
              this.setNextQuestion();  
        }
        console.log(state)
    }
         
    checkAnswer = (value) => {
        const rightAnswer = this.state.currentQuestion[2][0];
        console.log(value)
        console.log(rightAnswer)
        
        if(value === rightAnswer){
            this.setState(st => ({
                isCorrect : true
              }));
              
        }else{
            this.setState(st => ({
                isCorrect : false
              }));
        }
    }    
        
       render(){
    const {currentQuestion}  = this.state;
        return(
            <div>
    <h1 id="titlu">{}</h1>
            <h2 id="intrebare">{currentQuestion[1]} </h2>
        <div id="liste">
        <button id='istorie'type="button" class="clasaListe"  onClick={()=>this.checkAnswer(currentQuestion[0][0])} >{currentQuestion[0][0]}</button>
        <button id='geografie'type="button"class="clasaListe" onClick={() =>this.checkAnswer(currentQuestion[0][0])}>{currentQuestion[0][1]}</button>
        <button id='politica'type="button" class="clasaListe" onClick={() =>this.checkAnswer(currentQuestion[0][2])}>{currentQuestion[0][2]}</button>
         </div>    
        <div id='butoane'>
            <button id='butonA'type="button" class="butoane">A</button>
            <button id='butonB'type="button" class="butoane">B</button>
            <button id='butonC'type="button" class="butoane">C</button>
        </div>
        
        <div id='middle'> </div>
        <Progres 
        width = {50}/>
            <div id="butoane2" >
                <button id='prevButon'type="button" class="butoaneFunctionale" onClick={this.previosQuestion}>Back</button>
                <button id='saveAnswer'type="button" class="butoaneFunctionale" onClick={()=>this.saveAnswer(this.state.isCorrect)}>Save</button>
                <button id='raspTarziu'type="button" class="butoaneFunctionale">Answer later</button>
                <button id='nextButon'type="button" class="butoaneFunctionale" onClick={this.setNextQuestion}>Next</button>
            </div>
                
    
    
        <div id='middle'> </div> 
        
        <div class="raspunsuri">
        <div id="rscorect">Corecte:{this.state.corecte}</div>
       <div id="rsgresit">Gresite:{this.state.gresite}</div>
        </div>
      </div>
        )
        }
}



export default Chestionar;




const setCurrentAnswer = (buton) => {
    if (buton === 'a'){
        this.state.selectedAnswer = this.state.currentQuestion[0][0];
    }else if (buton === 'b'){
        this.state.selectedAnswer = this.state.currentQuestion[0][1];
    }else if ( buton === 'c'){
        this.state.selectedAnswer = this.state.currentQuestion[0][2];
    }
}
