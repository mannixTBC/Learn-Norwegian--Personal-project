// Explicit publication contract, shared by free, practical and live V2 modes.
export const learningLanguages = {nb:'Norwegian Bokmål',de:'German',fr:'French',en:'English',es:'Spanish',pt:'Portuguese',da:'Danish',it:'Italian',sv:'Swedish',nl:'Dutch'};
export const supportLanguages = {ro:'Romanian',en:'English',pl:'Polish',uk:'Ukrainian',lt:'Lithuanian',ar:'Arabic',de:'German',es:'Spanish'};
export const supportedPair=(learning,support)=>Object.hasOwn(learningLanguages,learning)&&Object.hasOwn(supportLanguages,support)&&learning!==support;
export const greetings={nb:'Hei! Hva har du lyst til å snakke om?',de:'Hallo! Worüber möchtest du sprechen?',fr:'Bonjour ! De quoi aimerais-tu parler ?',en:'Hello! What would you like to talk about?',es:'¡Hola! ¿De qué te gustaría hablar?',pt:'Olá! Sobre o que gostarias de falar?',da:'Hej! Hvad har du lyst til at tale om?',it:'Ciao! Di cosa vorresti parlare?',sv:'Hej! Vad vill du prata om?',nl:'Hallo! Waar wil je over praten?'};
export const closings={nb:'Takk for samtalen.',de:'Danke für das Gespräch.',fr:'Merci pour cette conversation.',en:'Thank you for the conversation.',es:'Gracias por la conversación.',pt:'Obrigado pela conversa.',da:'Tak for samtalen.',it:'Grazie per la conversazione.',sv:'Tack för samtalet.',nl:'Bedankt voor het gesprek.'};
export const freeLocales={
 ro:['Dialog liber','Alege un subiect și vorbește cu Nora în ritmul tău.','Tu'],
 en:['Free conversation','Choose a topic and talk with Nora at your own pace.','You'],
 pl:['Swobodna rozmowa','Wybierz temat i porozmawiaj z Norą we własnym tempie.','Ty'],
 uk:['Вільна розмова','Вибери тему та розмовляй із Норою у власному темпі.','Ти'],
 lt:['Laisvas pokalbis','Pasirink temą ir kalbėk su Nora savo tempu.','Tu'],
 ar:['محادثة حرة','اختر موضوعًا وتحدث مع نورا بالوتيرة التي تناسبك.','أنت'],
 de:['Freies Gespräch','Wähle ein Thema und sprich mit Nora in deinem Tempo.','Du'],
 es:['Conversación libre','Elige un tema y habla con Nora a tu ritmo.','Tú'],
};
