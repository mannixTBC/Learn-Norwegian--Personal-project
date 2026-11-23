// Explicit publication contract, shared by free, practical and live V2 modes.
export const learningLanguages = {nb:'Norwegian Bokmål',de:'German',fr:'French',en:'English',es:'Spanish',pt:'Portuguese',da:'Danish',it:'Italian',sv:'Swedish',nl:'Dutch'};
export const supportLanguages = {ro:'Romanian',en:'English',pl:'Polish',uk:'Ukrainian',lt:'Lithuanian',ar:'Arabic',de:'German',es:'Spanish'};
export const supportedPair=(learning,support)=>Object.hasOwn(learningLanguages,learning)&&Object.hasOwn(supportLanguages,support)&&learning!==support;
export const greetings={nb:'Hei! Hva har du lyst til å snakke om?',de:'Hallo! Worüber möchtest du sprechen?',fr:'Bonjour ! De quoi aimerais-tu parler ?',en:'Hello! What would you like to talk about?',es:'¡Hola! ¿De qué te gustaría hablar?',pt:'Olá! Sobre o que gostarias de falar?',da:'Hej! Hvad har du lyst til at tale om?',it:'Ciao! Di cosa vorresti parlare?',sv:'Hej! Vad vill du prata om?',nl:'Hallo! Waar wil je over praten?'};
// Free conversation does not always start with the same line. Each opener is a
// concrete everyday question an A1 learner can answer; the first is the open one.
export const freeOpenings={
 nb:[greetings.nb,'Hei! Hvordan har dagen din vært?','Hei! Hva liker du å gjøre på fritiden?','Hei! Hva har du spist i dag?','Hei! Hva skal du gjøre i helgen?'],
 de:[greetings.de,'Hallo! Wie war dein Tag?','Hallo! Was machst du gern in deiner Freizeit?','Hallo! Was hast du heute gegessen?','Hallo! Was machst du am Wochenende?'],
 fr:[greetings.fr,'Bonjour ! Comment s’est passée ta journée ?','Bonjour ! Qu’aimes-tu faire pendant ton temps libre ?','Bonjour ! Qu’as-tu mangé aujourd’hui ?','Bonjour ! Que fais-tu ce week-end ?'],
 en:[greetings.en,'Hello! How has your day been?','Hello! What do you like to do in your free time?','Hello! What have you eaten today?','Hello! What are you doing this weekend?'],
 es:[greetings.es,'¡Hola! ¿Qué tal tu día?','¡Hola! ¿Qué te gusta hacer en tu tiempo libre?','¡Hola! ¿Qué has comido hoy?','¡Hola! ¿Qué vas a hacer este fin de semana?'],
 pt:[greetings.pt,'Olá! Como foi o teu dia?','Olá! O que gostas de fazer nos tempos livres?','Olá! O que comeste hoje?','Olá! O que vais fazer no fim de semana?'],
 da:[greetings.da,'Hej! Hvordan har din dag været?','Hej! Hvad kan du lide at lave i din fritid?','Hej! Hvad har du spist i dag?','Hej! Hvad skal du lave i weekenden?'],
 it:[greetings.it,'Ciao! Com’è andata la tua giornata?','Ciao! Che cosa ti piace fare nel tempo libero?','Ciao! Che cosa hai mangiato oggi?','Ciao! Che cosa fai questo fine settimana?'],
 sv:[greetings.sv,'Hej! Hur har din dag varit?','Hej! Vad tycker du om att göra på fritiden?','Hej! Vad har du ätit i dag?','Hej! Vad ska du göra i helgen?'],
 nl:[greetings.nl,'Hallo! Hoe was je dag?','Hallo! Wat doe je graag in je vrije tijd?','Hallo! Wat heb je vandaag gegeten?','Hallo! Wat ga je dit weekend doen?'],
};
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
