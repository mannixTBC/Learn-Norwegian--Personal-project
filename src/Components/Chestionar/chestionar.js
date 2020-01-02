import React, { Component, useState }  from 'react';
import { randomQuestion } from './intrebari'
import intrebari from './intrebari';
import './chestionar.css';






function Chestionar() {

    
     const [isActive, setActive] = useState(false)
     let [x, setx] = useState(0)
    
    const [isCorrect, setCorrect] = useState(false)
        
        

    
    const currentQuestion = intrebari[x]
         
        const setNextQuestion = () =>{
            console.log('intra in functie');
            if ( x < intrebari.length - 1){
                setx(x + 1);
                console.log(x)
                console.log(currentQuestion)
                }
               
        }

        const preveusQuestion = () => {
            if(x>0){
                setx(x-1);
            }
            
        
        }
        const checkStatus = () => {
            console.log(isCorrect)
        }
        const checkAnswer = (buton) => {
            if(buton === 'a'&& currentQuestion[0][0] === currentQuestion[2][0]){
                return (setCorrect(true), console.log(isCorrect)) 
                        
            }else{
                return (setCorrect(false), console.log(isCorrect) )
            }
            
        }
        const saveAnswer = () =>{
            if ( isCorrect === true ){
                console.log('felicitari')
                
            }
        }
       
        return(
            <div>
    <h1 id="titlu">{currentQuestion[1]}</h1>
            <h2 id="intrebare"> </h2>
        <div id="liste">
        <button id='istorie'type="button" class="clasaListe" onClick={()=>checkAnswer('a') } >{currentQuestion[0][0]}</button>
                <button id='geografie'type="button"class="clasaListe" onClick={checkStatus} >{currentQuestion[0][1]}</button>
                <button id='politica'type="button" class="clasaListe" onClick={()=>checkAnswer('c')}>{currentQuestion[0][2]}</button>
         </div>    
        <div id='butoane'>
            <button id='butonA'type="button" class="butoane">A</button>
            <button id='butonB'type="button" class="butoane">B</button>
            <button id='butonC'type="button" class="butoane">C</button>
        </div>
        
        <div id='middle'> </div>
        <div class="progress">
            <div class="progress-bar progress-bar-striped bg-success" role="progressbar"  aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
        </div> 
            <div id="butoane2" >
                <button id='prevButon'type="button" class="butoaneFunctionale" onClick={preveusQuestion}>Back</button>
                <button id='saveAnswer'type="button" class="butoaneFunctionale" onClick={saveAnswer}>Save</button>
                <button id='raspTarziu'type="button" class="butoaneFunctionale">Answer later</button>
                <button id='nextButon'type="button" class="butoaneFunctionale" onClick={setNextQuestion}>Next</button>
            </div>
                
    
    
        <div id='middle'> </div> 
        
        <div class="raspunsuri">
        <div id="rscorect"> Raspunsuri corecte</div>
        <div id="rsgresit"> Raspunsuri gresite</div>
        </div>
      </div>
        )
    
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

