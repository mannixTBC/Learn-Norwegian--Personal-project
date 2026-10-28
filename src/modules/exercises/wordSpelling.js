import {createIllustratedWordQuestions} from './wordDiscoveryCatalog';
import {shufflePractice} from './practiceGameData';

export const spellingLetters = text => Array.from(text.normalize('NFC').toLocaleUpperCase('nb-NO')).filter(letter => /\p{L}/u.test(letter));
export const initialSpelling = answer => ({letters:Array(spellingLetters(answer).length).fill(''),revealed:[],attempts:0,lastWrong:null,done:false,correct:false});
export function spellingReducer(state, action) {
 if(state.done)return state;
 const target=spellingLetters(action.answer);
 if(action.type==='TYPE'){
  const letter=action.letter?.normalize('NFC').toLocaleUpperCase('nb-NO');
  const index=state.letters.indexOf('');
  if(index<0||!letter||!/^\p{L}$/u.test(letter))return state;
  return {...state,letters:state.letters.map((value,i)=>i===index?letter:value)};
 }
 if(action.type==='DELETE'){
  const index=state.letters.reduce((last,value,i)=>value&&!state.revealed.includes(i)?i:last,-1);
  return index<0?state:{...state,letters:state.letters.map((value,i)=>i===index?'':value)};
 }
 if(action.type==='HINT'){
  const index=target.findIndex((letter,i)=>state.letters[i]!==letter);
  return index<0?state:{...state,letters:state.letters.map((value,i)=>i===index?target[i]:value),revealed:[...state.revealed,index]};
 }
 if(action.type==='VERIFY'){
  const given=state.letters.join('');
  if(state.letters.some(letter=>!letter)||given===state.lastWrong)return state;
  const correct=given===target.join('');
  return {...state,attempts:state.attempts+1,lastWrong:correct?state.lastWrong:given,correct,done:correct||state.attempts>=1};
 }
 return state;
}
export function createWordSpellingSession(lessons,progress={},random=Math.random){
 const pool=createIllustratedWordQuestions(lessons);
 const completed=new Set(progress.completed||[]);
 const current=lessons[(progress.unlocked||1)-1]?.id;
 const known=pool.filter(item=>completed.has(item.lessonId)||item.lessonId===current);
 const primary=shufflePractice(known,random);
 // The finite picture bank may not cover five studied words; fill only missing places.
 const remaining=shufflePractice(pool.filter(item=>!known.includes(item)),random).sort((a,b)=>spellingLetters(a.answer).length-spellingLetters(b.answer).length);
 return [...primary,...remaining].slice(0,5).sort((a,b)=>spellingLetters(a.answer).length-spellingLetters(b.answer).length);
}
export const initialGuessing = () => ({guessed:[],revealed:[],done:false,correct:false,wrong:0});
export function guessingReducer(state,action){
 if(state.done)return state;
 const letters=spellingLetters(action.answer);
 const letter=action.type==='HINT'?letters.find(value=>!state.guessed.includes(value)):action.letter?.normalize('NFC').toLocaleUpperCase('nb-NO');
 if(!letter||!/^\p{L}$/u.test(letter)||state.guessed.includes(letter))return state;
 const guessed=[...state.guessed,letter],wrong=guessed.filter(value=>!letters.includes(value)).length;
 const correct=letters.every(value=>guessed.includes(value));
 return {guessed,wrong,correct,done:correct||wrong>=3,revealed:action.type==='HINT'?[...state.revealed,letter]:state.revealed};
}
