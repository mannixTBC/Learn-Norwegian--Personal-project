import React, { Component}  from 'react';
import intrebari from './intrebari.js';
import './chestionar.css';
import Progres from './progres';

class Chestionar extends Component{
   
    constructor(props) {
        super(props);       
        this.state = {           
          corecte : 0,
          gresite : 0,
          raspunse: 0,
          guessed: new Set([]),
          isActive : true,
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
  

    progresconstanta = 0;
    procentIntrebare = 100/intrebari.length;

    saveAnswer (state) {
        if(state === true && this.state.raspunse <= this.state.currentList.length - 1) {
            this.setState(st => ({
                corecte : st.corecte + 1,
                raspunse : st.raspunse + 1
              }));
            if(this.state.raspunse >= this.state.currentList.length-1){
                this.state.isActive = false;
            }
            this.progresconstanta = this.progresconstanta + this.procentIntrebare;
            this.setNextQuestion();
            console.log('varianta corecta')
            
        }
       
        else if (state === false) {
            this.setState(st => ({
                gresite : st.gresite + 1,
                raspunse : st.raspunse + 1
              }));
             
              if(this.state.raspunse >= this.state.currentList.length-1){
                this.state.isActive = false;
            }
              this.setNextQuestion();  
              this.progresconstanta = this.progresconstanta + this.procentIntrebare;
            
            console.log('varianta gresita')
        }
        console.log(this.state)
    }

    generateAnswers() {
        if(this.state.isActive === true){
        return(
            <div id="liste">
        <button id='istorie'type="button" class="clasaListe"  onClick={()=>this.checkAnswer(this.state.currentQuestion[0][0])} >{this.state.currentQuestion[0][0]}</button>
        <button id='geografie'type="button"class="clasaListe" onClick={() =>this.checkAnswer(this.state.currentQuestion[0][1])}>{this.state.currentQuestion[0][1]}</button>
        <button id='politica'type="button" class="clasaListe" onClick={() =>this.checkAnswer(this.state.currentQuestion[0][0])}>{this.state.currentQuestion[0][2]}</button>
            </div>
        )}

        else if ( this.state.isActive === false )
            {
                return (
                    <div class='mesaj'>
                        Testarea a luat sfarsit! Ai raspuns corect la {this.state.corecte} intrebari!

                    </div>
                )
            }
      }

      generateButtons(){
          if(this.state.isActive === true){
              return(
            <div id="butoane2" >
                <button id='prevButon'type="button" class="butoaneFunctionale" onClick={this.previosQuestion}>Back</button>
                <button id='saveAnswer'type="button" class="butoaneFunctionale" onClick={()=>this.saveAnswer(this.state.isCorrect)}>Save</button>
                <button id='nextButon'type="button" class="butoaneFunctionale" onClick={this.setNextQuestion}>Next</button>
            </div>
              )
          }
      }

      generateQuestion(){
        const intrebare = this.state.currentQuestion[1];
        if(this.state.isActive === true){
            return(<div>{intrebare}</div>
                
            )
        }
      }
      generateHelpMessage(){
          if(this.state.raspunse === 0) {
              return(<div class="helpMessage">Selecteaza raspunsul corect apoi apasa click pe "Save"</div>
                 
              )
          }
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


    
    progresconstanta = 0;
    procentIntrebare = 100/intrebari.length;
       render(){
    
        return(
            <div>
    <h1 id="titlu">{}</h1>
            <h2 id="intrebare">{this.generateQuestion()} </h2>
        <div >
       {
           this.generateAnswers()
       }
       </div>    
        <div id='butoane'>
            <button id='butonA'type="button" class="butoane">A</button>
            <button id='butonB'type="button" class="butoane">B</button>
            <button id='butonC'type="button" class="butoane">C</button>
        </div>
        
        <div id='middle'> </div>
        <div >{ this.generateHelpMessage()}</div>
        <Progres
        width = {this.progresconstanta}/>
            {this.generateButtons()}
                
    
    
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


// {/* <button id='istorie'type="button" class="clasaListe"  onClick={()=>this.checkAnswer(currentQuestion[0][0])} >{currentQuestion[0][0]}</button>
//         <button id='geografie'type="button"class="clasaListe" onClick={() =>this.checkAnswer(currentQuestion[0][1])}>{currentQuestion[0][1]}</button>
//         <button id='politica'type="button" class="clasaListe" onClick={() =>this.checkAnswer(currentQuestion[0][0])}>{currentQuestion[0][2]}</button> */}

// {/* <div id="butoane2" >
//                 <button id='prevButon'type="button" class="butoaneFunctionale" onClick={this.previosQuestion}>Back</button>
//                 <button id='saveAnswer'type="button" class="butoaneFunctionale" onClick={()=>this.saveAnswer(this.state.isCorrect)}>Save</button>
//                 <button id='nextButon'type="button" class="butoaneFunctionale" onClick={this.setNextQuestion}>Next</button>
//             </div> */}