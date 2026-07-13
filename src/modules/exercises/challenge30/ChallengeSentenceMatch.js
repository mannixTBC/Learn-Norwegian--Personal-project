import React, { useMemo, useState } from 'react';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import './ChallengeSentenceMatch.css';
import './SentenceFeedback.css';

const examples = {
  'å forlate': ['Hun måtte forlate møtet tidlig.', 'Ea a trebuit să părăsească întâlnirea mai devreme.'],
  'å følge': ['Kan du følge meg til stasjonen?', 'Poți să mă însoțești până la gară?'],
  'å kjøre': ['Jeg kjører til jobb hver morgen.', 'Conduc spre serviciu în fiecare dimineață.'],
  'å sykle': ['Vi sykler langs fjorden i helgen.', 'Mergem cu bicicleta de-a lungul fiordului în weekend.'],
  'å svømme': ['Barna liker å svømme i innsjøen.', 'Copiilor le place să înoate în lac.'],
  'å løpe': ['Han løper fem kilometer etter jobb.', 'El aleargă cinci kilometri după serviciu.'],
  'å hoppe': ['Katten hoppet opp på stolen.', 'Pisica a sărit pe scaun.'],
  'å falle': ['Temperaturen kan falle i løpet av natten.', 'Temperatura poate să scadă în timpul nopții.'],
  'å løfte': ['Du må løfte esken forsiktig.', 'Trebuie să ridici cutia cu grijă.'],
  'å bære': ['Hun bærer en tung ryggsekk.', 'Ea poartă un rucsac greu.'],
  'å kle': ['Det er viktig å kle seg varmt.', 'Este important să te îmbraci gros.'],
  'å vaske': ['Jeg må vaske klær i kveld.', 'Trebuie să spăl hainele în seara aceasta.'],
  'å tørke': ['La jakken tørke før du går ut.', 'Lasă geaca să se usuce înainte să ieși.'],
  'å lage': ['Vi lager middag sammen i dag.', 'Pregătim cina împreună astăzi.'],
  'å røre': ['Ikke rør den varme pannen.', 'Nu atinge tigaia fierbinte.'],
  'å holde': ['Kan du holde døren åpen?', 'Poți să ții ușa deschisă?'],
  'å slippe': ['Hun slapp nøklene på gulvet.', 'Ea a scăpat cheile pe podea.'],
  'å smake': ['Vil du smake på suppen?', 'Vrei să guști supa?'],
  'å kaste': ['Ikke kast papir på bakken.', 'Nu arunca hârtie pe jos.'],
  'å fange': ['Bildet fanger lyset mellom fjellene.', 'Imaginea surprinde lumina dintre munți.'],
  'å skyte': ['De skyter en ny film i Bergen.', 'Ei filmează un film nou în Bergen.'],
  'å fly': ['Vi skal fly til Tromsø i morgen.', 'Vom zbura la Tromsø mâine.'],
  'å lande': ['Flyet lander om tjue minutter.', 'Avionul aterizează peste douăzeci de minute.'],
  'å seile': ['De seiler langs norskekysten.', 'Ei navighează de-a lungul coastei norvegiene.'],
  'å klare': ['Jeg tror vi klarer oppgaven sammen.', 'Cred că reușim sarcina împreună.'],
  'å greie': ['Greier du å forklare forskjellen?', 'Reușești să explici diferența?'],
  'å lyve': ['Det er aldri lurt å lyve.', 'Nu este niciodată bine să minți.'],
  'å synes': ['Jeg synes forslaget er interessant.', 'Consider că propunerea este interesantă.'],
  'å mene': ['Hva mener du med det?', 'Ce vrei să spui prin asta?'],
  'å tenke': ['Vi må tenke på konsekvensene.', 'Trebuie să ne gândim la consecințe.'],
};

const getExample = (verb) => examples[verb.norwegian] || [
  `I dag øver vi på verbet «${verb.norwegian}».`,
  `Astăzi exersăm verbul „${verb.romanian}”.`,
];

const ChallengeSentenceMatch = ({ verbs, onComplete }) => {
  const questions = useMemo(() => verbs.slice(0, 3).map((verb, index) => {
    const [sentence, translation] = getExample(verb);
    const distractors = verbs.filter((_, otherIndex) => otherIndex !== index).slice(0, 2).map((item) => getExample(item)[1]);
    return { sentence, translation, options: [translation, ...distractors].sort(() => Math.random() - 0.5) };
  }), [verbs]);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const score = questions.filter((question, index) => answers[index] === question.translation).length;

  const checkAnswers = () => {
    setChecked(true);
    if (score === questions.length && onComplete) onComplete();
  };

  return (
    <section className="sentence-match">
      <div className="sentence-match__heading"><div><span>Exercițiu suplimentar</span><h3>Asociază propoziția cu sensul ei</h3><p>Ascultă propoziția completă și alege traducerea potrivită.</p></div><span>{questions.length} propoziții</span></div>
      <div className="sentence-match__list">
        {questions.map((question, index) => {
          const correct = answers[index] === question.translation;
          return <article className={checked ? (correct ? 'correct' : 'wrong') : ''} key={question.sentence}><div className="sentence-match__number">{String(index + 1).padStart(2, '0')}</div><div className="sentence-match__question"><div><blockquote lang="no">{question.sentence}</blockquote><button type="button" onClick={() => speakNorwegian(question.sentence)} aria-label={`Ascultă propoziția: ${question.sentence}`}>▶ Ascultă</button></div><div className="sentence-match__options">{question.options.map((option) => <button type="button" className={answers[index] === option ? 'selected' : ''} disabled={checked} onClick={() => setAnswers((current) => ({ ...current, [index]: option }))} key={option}>{option}</button>)}</div>{checked && !correct && <p className="sentence-match__feedback">Răspuns corect: <strong>{question.translation}</strong></p>}{checked && correct && <p className="sentence-match__feedback">Corect! Ai înțeles propoziția.</p>}</div></article>;
        })}
      </div>
      {!checked ? <button className="sentence-match__check" type="button" disabled={Object.keys(answers).length !== questions.length} onClick={checkAnswers}>Verifică propozițiile</button> : <div className="sentence-match__score">Scor: <strong>{score} / {questions.length}</strong><button type="button" onClick={() => { setAnswers({}); setChecked(false); }}>Repetă exercițiul</button></div>}
    </section>
  );
};

export default ChallengeSentenceMatch;
