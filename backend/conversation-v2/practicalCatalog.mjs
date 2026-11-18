import {learningLanguages,supportedPair,freeLocales} from './languages.mjs';

// Authored for V2. No dependency on the legacy scenario catalogue or progress.
const levels=['A1','A2','B1','B2','C1','C2'];
const rubrics=[
 ['Say you want to go to the city centre today. Simple words or fragments are sufficient.','Request one single ticket, not a return ticket.','Confirm the partner offer of one single ticket to the centre for today.'],
 ['Explain that the Tuesday meeting is no longer possible.','Ask for another meeting and communicate a preference between Wednesday morning and Thursday afternoon.','Confirm one day and time actually offered by the partner.'],
 ['Explain that two people want a day trip with a total budget of 80 euros.','Compare the museum and nature park, with a reason for a preference.','Agree on one feasible option and its total cost, following the partner proposal.'],
 ['Explain why you want two remote working days while recognising the need for team coordination.','Negotiate a trade-off between fixed days and flexibility, with a concrete mitigation for missed meetings.','Agree a four-week trial, shared availability and a review with the partner.'],
 ['Frame the tension between a quiet public library and inclusive community activities without dismissing either group.','Evaluate a quiet-zone and scheduled-activity proposal, addressing unequal access and a plausible counterargument.','Agree a reversible trial and a concrete way to gather feedback from both groups; do not claim invented evidence.'],
 ['Distinguish the conflicting interpretations of an ambiguous public statement from established facts, with appropriate uncertainty.','Reformulate each side position fairly and challenge an implied assumption diplomatically, without adopting either interpretation as fact.','Negotiate a jointly acceptable clarification that preserves uncertainty and identifies what must be verified, after the partner proposal.'],
];
const facts=[
 'One single ticket to the city centre for today is available. Price is 3 euros. Do not introduce other products unless asked.',
 'The original meeting is Tuesday. Available alternatives: Wednesday at 10:00 or Thursday at 14:00. Offer only these slots.',
 'The museum costs 60 euros for two including transport. The nature park costs 40 euros for two including transport. Both are open and reachable today; weather is unknown.',
 'The manager can approve a four-week trial of two remote days per week. Tuesday team meetings require attendance. Other days are negotiable. No permanent policy change is approved.',
 'Both quiet study and community access are library responsibilities. A quiet zone plus scheduled activities can be tried for one month. No survey, attendance statistics or budget figures are available. Invite input from both groups.',
 'The only verified statement is: We may revise access arrangements after consultation. One group interprets this as a promised restriction; another as a promise of wider access. Neither outcome is confirmed. Consultation has not yet happened. No hidden decision or intent is known.',
];
const openings={
 nb:['Hei! Hvor vil du reise?','Hei! Passer møtet på tirsdag?','Hei! Hva slags dagstur ønsker dere?','Du ville diskutere hjemmekontor. Hva foreslår du?','Hvordan kan biblioteket gi plass til både ro og aktivitet?','Hvordan tolker du formuleringen om at tilgangsordningene kan bli revidert etter en høring?'],
 de:['Hallo! Wohin möchtest du fahren?','Hallo! Passt dir das Treffen am Dienstag?','Hallo! Was für einen Tagesausflug möchtet ihr machen?','Du wolltest über Homeoffice sprechen. Was schlägst du vor?','Wie kann die Bibliothek sowohl Ruhe als auch Aktivitäten ermöglichen?','Wie deutest du die Aussage, dass die Zugangsregelungen nach einer Anhörung überarbeitet werden könnten?'],
 fr:['Bonjour ! Où veux-tu aller ?','Bonjour ! La réunion de mardi te convient-elle ?','Bonjour ! Quel type de sortie à la journée souhaitez-vous faire ?','Tu souhaitais parler du télétravail. Que proposes-tu ?','Comment la bibliothèque peut-elle accueillir à la fois le calme et les activités ?','Comment interprètes-tu la déclaration selon laquelle les modalités d’accès pourraient être revues après consultation ?'],
 en:['Hello! Where would you like to go?','Hello! Does the meeting on Tuesday work for you?','Hello! What kind of day trip would you like?','You wanted to discuss working from home. What do you propose?','How can the library provide space for both quiet study and activities?','How do you interpret the statement that access arrangements may be revised after consultation?'],
 es:['¡Hola! ¿Adónde quieres ir?','¡Hola! ¿Te viene bien la reunión del martes?','¡Hola! ¿Qué tipo de excursión de un día queréis hacer?','Querías hablar del teletrabajo. ¿Qué propones?','¿Cómo puede la biblioteca ofrecer espacio tanto para el silencio como para las actividades?','¿Cómo interpretas la declaración de que las condiciones de acceso podrían revisarse tras una consulta?'],
 pt:['Olá! Para onde queres ir?','Olá! A reunião de terça-feira dá-te jeito?','Olá! Que tipo de passeio de um dia gostariam de fazer?','Querias falar sobre teletrabalho. O que propões?','Como pode a biblioteca oferecer espaço tanto para o silêncio como para as atividades?','Como interpretas a declaração de que as condições de acesso poderão ser revistas após uma consulta?'],
 da:['Hej! Hvor vil du rejse hen?','Hej! Passer mødet på tirsdag dig?','Hej! Hvilken slags dagstur ønsker I?','Du ville tale om hjemmearbejde. Hvad foreslår du?','Hvordan kan biblioteket give plads til både ro og aktiviteter?','Hvordan fortolker du udsagnet om, at adgangsforholdene muligvis bliver ændret efter en høring?'],
 it:['Ciao! Dove vuoi andare?','Ciao! Ti va bene la riunione di martedì?','Ciao! Che tipo di gita di un giorno volete fare?','Volevi parlare del lavoro da casa. Che cosa proponi?','Come può la biblioteca offrire spazio sia per il silenzio sia per le attività?','Come interpreti la dichiarazione secondo cui le condizioni di accesso potrebbero essere riviste dopo una consultazione?'],
 sv:['Hej! Vart vill du resa?','Hej! Passar mötet på tisdag?','Hej! Vilken sorts dagsutflykt vill ni göra?','Du ville prata om distansarbete. Vad föreslår du?','Hur kan biblioteket ge plats åt både lugn och aktiviteter?','Hur tolkar du uttalandet om att tillträdesreglerna kan komma att ändras efter ett samråd?'],
 nl:['Hallo! Waar wil je naartoe?','Hallo! Komt de afspraak op dinsdag je uit?','Hallo! Wat voor dagtocht willen jullie maken?','Je wilde het over thuiswerken hebben. Wat stel je voor?','Hoe kan de bibliotheek ruimte bieden voor zowel rust als activiteiten?','Hoe interpreteer je de uitspraak dat de toegangsregelingen na overleg mogelijk worden herzien?'],
};
// Each brief supplies all learner facts; partner-only options stay on the server.
const locales={
 ro:{titles:['Un bilet spre centru','Mută întâlnirea','O excursie în buget','Negociază lucrul de acasă','O bibliotecă pentru toți','Clarifică fără să presupui'],goals:['Prezintă situația.','Formulează și justifică cererea sau propunerea.','Confirmă acordul cu Nora.'],briefs:[
 'Vrei să ajungi astăzi în centru. Cere un singur bilet, doar dus, și confirmă oferta Norei.',
 'Nu mai poți participa marți. Cere o altă întâlnire, exprimă o preferință între miercuri dimineață și joi după-amiază și confirmă ziua și ora oferite.',
 'Planifici o excursie de o zi pentru două persoane, cu 80 de euro în total. Compară muzeul și parcul natural, justifică preferința și confirmă opțiunea și costul.',
 'Cere două zile de lucru de acasă pe săptămână. Discută compromisul între zile fixe și flexibilitate, protejează întâlnirile echipei și conveniți o probă de patru săptămâni, disponibilitatea și evaluarea ei.',
 'Biblioteca trebuie să permită atât studiu liniștit, cât și activități comunitare. Analizează zonele liniștite și activitățile programate, răspunde unei obiecții privind accesul și conveniți o probă reversibilă cu feedback din ambele grupuri.',
 'Declarația spune doar că regulile de acces ar putea fi revizuite după consultare. Un grup înțelege o restricție promisă, altul o extindere promisă. Separă faptele de interpretări, reformulează echitabil ambele poziții, discută o presupunere și conveniți o clarificare care păstrează incertitudinea și spune ce trebuie verificat.']},
 en:{titles:['A ticket to the centre','Move the meeting','A trip within budget','Negotiate remote work','A library for everyone','Clarify without assuming'],goals:['Explain the situation.','Make and justify your request or proposal.','Confirm the agreement with Nora.'],briefs:[
 'You want to go to the city centre today. Ask for one single ticket, not a return, and confirm Nora’s offer.',
 'You cannot attend on Tuesday. Ask to move the meeting, express a preference between Wednesday morning and Thursday afternoon, and confirm the offered day and time.',
 'Plan a day trip for two with a total budget of 80 euros. Compare the museum and nature park, give a reason for your preference, and agree the option and total cost.',
 'Ask for two remote working days each week. Discuss fixed days versus flexibility, protect team meetings, and agree a four-week trial, shared availability and a review.',
 'The library must support quiet study and community activities. Evaluate quiet zones and scheduled events, address an objection about unequal access, and agree a reversible trial with feedback from both groups.',
 'The statement only says access arrangements may be revised after consultation. One group sees a promised restriction, another a promised expansion. Separate facts from interpretations, fairly reformulate both positions, question an assumption and agree a clarification preserving uncertainty and identifying what needs checking.']},
 pl:{titles:['Bilet do centrum','Przełóż spotkanie','Wycieczka w budżecie','Negocjuj pracę zdalną','Biblioteka dla wszystkich','Wyjaśnij bez założeń'],goals:['Przedstaw sytuację.','Sformułuj i uzasadnij prośbę lub propozycję.','Potwierdź ustalenia z Norą.'],briefs:[
 'Chcesz dziś pojechać do centrum. Poproś o jeden bilet w jedną stronę i potwierdź ofertę Nory.',
 'Nie możesz przyjść we wtorek. Poproś o inny termin, wybierz między środowym porankiem a czwartkowym popołudniem i potwierdź zaproponowany dzień i godzinę.',
 'Planujesz jednodniową wycieczkę dla dwóch osób za łącznie 80 euro. Porównaj muzeum i park przyrodniczy, uzasadnij wybór i uzgodnij opcję oraz koszt.',
 'Poproś o dwa dni pracy zdalnej tygodniowo. Omów stałe dni i elastyczność, uwzględnij spotkania zespołu i uzgodnij czterotygodniową próbę, dostępność oraz ocenę.',
 'Biblioteka ma służyć cichej nauce i wydarzeniom lokalnym. Oceń strefy ciszy i zaplanowane zajęcia, odpowiedz na zastrzeżenie dotyczące nierównego dostępu i uzgodnij odwracalną próbę z opiniami obu grup.',
 'Oświadczenie mówi tylko o możliwej zmianie zasad dostępu po konsultacjach. Jedna grupa widzi obietnicę ograniczeń, druga rozszerzenia. Oddziel fakty od interpretacji, przedstaw uczciwie obie strony, podważ założenie i uzgodnij wyjaśnienie zachowujące niepewność oraz wskazujące, co sprawdzić.']},
 uk:{titles:['Квиток до центру','Перенеси зустріч','Поїздка в межах бюджету','Домовся про дистанційну роботу','Бібліотека для всіх','Уточни без припущень'],goals:['Опиши ситуацію.','Сформулюй та обґрунтуй прохання або пропозицію.','Підтвердь домовленість із Норою.'],briefs:[
 'Ти хочеш сьогодні поїхати до центру. Попроси один квиток в один бік і підтвердь пропозицію Нори.',
 'Ти не можеш прийти у вівторок. Попроси перенести зустріч, вислови перевагу між ранком середи та другою половиною четверга й підтвердь запропоновані день і час.',
 'Плануєш одноденну поїздку для двох із загальним бюджетом 80 євро. Порівняй музей і природний парк, обґрунтуй вибір та узгодь варіант і вартість.',
 'Попроси два дні дистанційної роботи на тиждень. Обговори фіксовані дні та гнучкість, врахуй зустрічі команди й узгодь чотиритижневу пробу, доступність та її оцінку.',
 'Бібліотека має забезпечувати тихе навчання та громадські заходи. Оціни тихі зони й заплановані заняття, розглянь заперечення щодо нерівного доступу та узгодь зворотну пробу з відгуками обох груп.',
 'Заява лише допускає перегляд правил доступу після консультацій. Одна група бачить обіцянку обмеження, інша — розширення. Відокрем факти від тлумачень, справедливо перефразуй обидві позиції, постав під сумнів припущення й узгодь уточнення, яке зберігає невизначеність і вказує, що перевірити.']},
 lt:{titles:['Bilietas į centrą','Perkelk susitikimą','Išvyka pagal biudžetą','Susitark dėl nuotolinio darbo','Biblioteka visiems','Paaiškink be prielaidų'],goals:['Pristatyk situaciją.','Pateik ir pagrįsk prašymą ar pasiūlymą.','Patvirtink susitarimą su Nora.'],briefs:[
 'Šiandien nori nuvykti į centrą. Paprašyk vieno bilieto į vieną pusę ir patvirtink Noros pasiūlymą.',
 'Antradienį dalyvauti negali. Paprašyk kito susitikimo, pasirink trečiadienio rytą arba ketvirtadienio popietę ir patvirtink pasiūlytą dieną bei laiką.',
 'Planuoji vienos dienos išvyką dviem už iš viso 80 eurų. Palygink muziejų ir gamtos parką, pagrįsk pasirinkimą ir susitark dėl varianto bei kainos.',
 'Paprašyk dviejų nuotolinio darbo dienų per savaitę. Aptark pastovias dienas ir lankstumą, atsižvelk į komandos susitikimus ir sutark dėl keturių savaičių bandymo, pasiekiamumo bei įvertinimo.',
 'Biblioteka turi suderinti tylų mokymąsi ir bendruomenės veiklas. Įvertink tylos zonas bei suplanuotus renginius, atsakyk į prieštaravimą dėl nelygios prieigos ir sutark dėl atšaukiamo bandymo su abiejų grupių atsiliepimais.',
 'Pareiškime tik sakoma, kad po konsultacijų prieigos tvarka gali būti peržiūrėta. Vieni mato pažadą riboti, kiti — plėsti prieigą. Atskirk faktus nuo interpretacijų, sąžiningai perfrazuok abi pozicijas, suabejok prielaida ir sutark dėl paaiškinimo, išlaikančio neapibrėžtumą ir nurodančio, ką patikrinti.']},
 ar:{titles:['تذكرة إلى المركز','غيّر موعد الاجتماع','رحلة ضمن الميزانية','تفاوض بشأن العمل عن بُعد','مكتبة للجميع','وضّح دون افتراضات'],goals:['اشرح الموقف.','قدّم طلبك أو اقتراحك وبرّره.','أكّد الاتفاق مع نورا.'],briefs:[
 'تريد الذهاب إلى وسط المدينة اليوم. اطلب تذكرة واحدة للذهاب فقط وأكّد عرض نورا.',
 'لا تستطيع الحضور يوم الثلاثاء. اطلب موعدًا آخر وعبّر عن تفضيلك بين صباح الأربعاء وبعد ظهر الخميس وأكّد اليوم والوقت المقترحين.',
 'تخطط لرحلة ليوم واحد لشخصين بميزانية إجمالية قدرها 80 يورو. قارن بين المتحف والمتنزه الطبيعي وبرّر اختيارك واتفق على الخيار والتكلفة.',
 'اطلب يومين للعمل عن بُعد كل أسبوع. ناقش الأيام الثابتة مقابل المرونة مع مراعاة اجتماعات الفريق واتفق على تجربة لأربعة أسابيع وأوقات التوفر وتقييم التجربة.',
 'يجب أن تتيح المكتبة الدراسة الهادئة والأنشطة المجتمعية. قيّم المناطق الهادئة والأنشطة المجدولة وناقش اعتراضًا بشأن تفاوت فرص الوصول واتفق على تجربة قابلة للتراجع مع آراء المجموعتين.',
 'يقول البيان فقط إن ترتيبات الوصول قد تُراجع بعد التشاور. ترى مجموعة وعدًا بالتقييد وأخرى وعدًا بالتوسيع. افصل الحقائق عن التأويلات وأعد صياغة الموقفين بإنصاف وناقش افتراضًا واتفق على توضيح يحافظ على عدم اليقين ويحدد ما يحتاج إلى التحقق.']},
 de:{titles:['Eine Fahrkarte ins Zentrum','Das Treffen verschieben','Ein Ausflug im Budget','Homeoffice aushandeln','Eine Bibliothek für alle','Klären ohne Annahmen'],goals:['Beschreibe die Situation.','Formuliere und begründe deinen Wunsch oder Vorschlag.','Bestätige die Vereinbarung mit Nora.'],briefs:[
 'Du möchtest heute ins Zentrum fahren. Bitte um eine einfache Fahrkarte für eine Person und bestätige Noras Angebot.',
 'Du kannst am Dienstag nicht teilnehmen. Bitte um einen anderen Termin, äußere eine Vorliebe für Mittwochvormittag oder Donnerstagnachmittag und bestätige den angebotenen Tag und die Uhrzeit.',
 'Plane einen Tagesausflug für zwei Personen mit insgesamt 80 Euro. Vergleiche Museum und Naturpark, begründe deine Wahl und vereinbare Ziel und Gesamtkosten.',
 'Bitte um zwei Homeoffice-Tage pro Woche. Besprich feste Tage und Flexibilität, berücksichtige Teamtreffen und vereinbare einen vierwöchigen Versuch, Erreichbarkeit und Auswertung.',
 'Die Bibliothek soll ruhiges Lernen und Gemeinschaftsaktivitäten ermöglichen. Bewerte Ruhezonen und geplante Veranstaltungen, gehe auf einen Einwand zur ungleichen Zugänglichkeit ein und vereinbare einen rückgängig machbaren Versuch mit Rückmeldungen beider Gruppen.',
 'Die Aussage besagt nur, dass Zugangsregeln nach einer Anhörung überarbeitet werden könnten. Eine Gruppe sieht ein Versprechen zur Einschränkung, die andere zur Erweiterung. Trenne Fakten von Deutungen, formuliere beide Positionen fair, hinterfrage eine Annahme und vereinbare eine Klarstellung, die Unsicherheit und Prüfbedarf benennt.']},
 es:{titles:['Un billete al centro','Cambia la reunión','Una excursión dentro del presupuesto','Negocia el teletrabajo','Una biblioteca para todos','Aclara sin suponer'],goals:['Explica la situación.','Formula y justifica tu petición o propuesta.','Confirma el acuerdo con Nora.'],briefs:[
 'Quieres ir al centro hoy. Pide un billete de ida para una persona y confirma la oferta de Nora.',
 'No puedes asistir el martes. Pide otra reunión, expresa una preferencia entre el miércoles por la mañana y el jueves por la tarde y confirma el día y la hora ofrecidos.',
 'Planea una excursión de un día para dos con un presupuesto total de 80 euros. Compara el museo y el parque natural, justifica tu preferencia y acuerda la opción y el coste.',
 'Pide dos días de teletrabajo por semana. Habla de días fijos frente a flexibilidad, respeta las reuniones del equipo y acuerda una prueba de cuatro semanas, disponibilidad y evaluación.',
 'La biblioteca debe permitir el estudio tranquilo y las actividades comunitarias. Evalúa zonas silenciosas y actividades programadas, responde a una objeción sobre el acceso desigual y acuerda una prueba reversible con opiniones de ambos grupos.',
 'La declaración solo dice que las condiciones de acceso podrían revisarse tras una consulta. Un grupo ve una promesa de restricción y otro de ampliación. Separa hechos e interpretaciones, reformula ambas posiciones con imparcialidad, cuestiona una suposición y acuerda una aclaración que mantenga la incertidumbre e indique qué verificar.']},
};
export const practicalConversations=Object.keys(learningLanguages).flatMap(learningLanguage=>levels.map((level,i)=>({
 schemaVersion:2,id:`practice-${learningLanguage}-${level.toLowerCase()}`,familyId:`v2-task-${level.toLowerCase()}`,version:1,kind:'scenario',learningLanguage,level,maxTurns:i<2?10:16,
 states:['discussion','agreed'],initialState:'discussion',
 criteria:rubrics[i].map((meaning,n)=>({id:`goal-${n+1}`,meaning,requiresPartnerContext:n===2})),
 transitions:[{from:'discussion',to:'agreed',requires:['goal-1','goal-2','goal-3'],terminal:true}],
 variants:[{id:'reference',opening:openings[learningLanguage][i],facts:[{id:'constraints',audience:'partner',text:facts[i]}]}],
 locales:Object.fromEntries(Object.entries(locales).filter(([support])=>supportedPair(learningLanguage,support)).map(([support,l])=>[support,{
  title:l.titles[i],brief:l.briefs[i],hint:l.briefs[i],learnerRole:freeLocales[support][2],partnerRole:'Nora',criteria:Object.fromEntries(l.goals.map((label,n)=>[`goal-${n+1}`,label])),
 }])),
})));
