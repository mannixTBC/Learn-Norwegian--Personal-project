// Examples and illustrations adapted from Android's PrepositionsScreen and ConjunctionsScreen.
const positions=[['i','în','i'],['på','pe','pa'],['under','sub','under']];
const conjunctions=[
 ['og','Jeg liker kaffe','og te.','Îmi plac cafeaua și ceaiul.','og adaugă o idee.'],
 ['men','Jeg liker kaffe,','men ikke te.','Îmi place cafeaua, dar nu și ceaiul.','men arată un contrast.'],
 ['eller','Vil du ha kaffe','eller te?','Vrei cafea sau ceai?','eller oferă o alegere.'],
];
export const basicGuides={
 prepositions:{id:'prepositions',title:'Prepoziții',chapters:positions.map(([word,meaning,image])=>({id:image,tab:word,title:`${word} — ${meaning}`,subtitle:'Observă poziția și alege prepoziția.',reminder:`${word} înseamnă „${meaning}” în acest exemplu.`,blocks:[{kind:'picture',src:`/images/grammar/position-${image}.png`,alt:`Mingea este ${meaning} cutie.`},{kind:'sentences',title:'Într-o propoziție',examples:[{text:`Ballen er ${word} esken.`}]}],questions:positions.map(([answer,translation,picture])=>({id:picture,sentence:'Ballen er ___ esken.',translation:`Mingea este ${translation} cutie.`,image:`/images/grammar/position-${picture}.png`,answer,options:positions.map(p=>p[0]),explanation:`${answer} indică poziția „${translation}”.`}))}))},
 conjunctions:{id:'conjunctions',title:'Conjuncții',chapters:conjunctions.map(([word,before,after,translation,rule])=>({id:word,tab:word,title:rule,subtitle:'Leagă două idei.',reminder:rule,blocks:[{kind:'picture',src:`/images/grammar/conjunction-${word}.png`,alt:translation},{kind:'sentences',title:'Într-o propoziție',examples:[{text:`${before} ${after}`,translation}]}],questions:conjunctions.map(([answer,start,end,ro,note])=>({id:answer,sentence:`${start} ___${end.slice(answer.length)}`,translation:ro,answer,options:conjunctions.map(p=>p[0]),explanation:note}))}))},
};
