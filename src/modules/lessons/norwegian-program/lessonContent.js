import { a2Lessons } from './a2Content';
import { b1Lessons } from './b1Content';
import { b2Lessons } from './b2Content';
import { a1ExtraLessons } from './a1ExtraContent';
import { a2ExtraLessons } from './a2ExtraContent';
import { b2ExtraLessons } from './b2ExtraContent';

const baseA1Lessons = [
  {
    id: 1, title: 'Salutări și prezentări', duration: 15,
    objectives: ['să saluți și să răspunzi la salut', 'să spui cum te numești', 'să întrebi simplu cum se simte cineva'],
    vocabulary: [
      ['Hei', 'Salut', 'Hei! Jeg heter Anna.', 'Salut! Mă numesc Anna.'],
      ['Jeg heter', 'Mă numesc', 'Jeg heter Anna.', 'Mă numesc Anna.'],
      ['Hva heter du?', 'Cum te numești?', 'Hei! Hva heter du?', 'Salut! Cum te numești?'],
      ['Hvordan har du det?', 'Cum te simți?', 'Hvordan har du det i dag?', 'Cum te simți astăzi?'],
      ['Bra, takk', 'Bine, mulțumesc', 'Jeg har det bra, takk.', 'Sunt bine, mulțumesc.'],
      ['Hyggelig å møte deg', 'Încântat de cunoștință', 'Hyggelig å møte deg!', 'Încântat(ă) de cunoștință!'],
    ],
    dialogue: [['Anna', 'Hei! Jeg heter Anna. Hva heter du?', 'Salut! Mă numesc Anna. Cum te numești?'], ['Lars', 'Jeg heter Lars. Hyggelig å møte deg!', 'Mă numesc Lars. Încântat de cunoștință!'], ['Anna', 'Hyggelig å møte deg! Hvordan har du det?', 'Încântată de cunoștință! Cum te simți?'], ['Lars', 'Bra, takk.', 'Bine, mulțumesc.']],
    grammar: { title: '„Jeg”, „du” și verbul „er”', rule: '„Jeg” înseamnă „eu”, „du” înseamnă „tu”, iar verbul rămâne la aceeași formă: jeg er, du er.', examples: ['Jeg er Anna. — Eu sunt Anna.', 'Du er Lars. — Tu ești Lars.'], wrong: 'Jeg erer Anna.' },
    exercises: [
      { type:'choice', prompt:'Cum întrebi o persoană cum se numește?', options:['Hvordan har du det?','Hva heter du?','Bra, takk.'], answer:1, explanation:'„Hva heter du?” înseamnă „Cum te numești?”.' },
      { type:'fill', prompt:'Completează: „Jeg ___ Anna.”', answer:'heter', explanation:'„Jeg heter...” este formula folosită pentru a spune numele.' },
      { type:'order', prompt:'Construiește răspunsul „Bine, mulțumesc”.', words:['takk','Bra'], answer:['Bra','takk'], explanation:'Răspunsul scurt și natural este „Bra, takk”.' },
    ],
  },
  {
    id: 2, title: 'La cafenea', duration: 18,
    objectives: ['să comanzi ceva simplu', 'să folosești formule politicoase', 'să recunoști articolele Bokmål „en” și „et”'],
    vocabulary: [['En kaffe','O cafea','En kaffe, takk.','O cafea, vă rog.'],['Et smørbrød','Un sandviș','Jeg vil ha et smørbrød.','Doresc un sandviș.'],['En kake','O prăjitură','Jeg vil ha en kake.','Doresc o prăjitură.'],['Vann','Apă','Jeg vil ha vann.','Doresc apă.'],['Jeg vil ha','Doresc','Jeg vil ha en kaffe.','Doresc o cafea.'],['Ja, takk','Da, mulțumesc','Ja, takk.','Da, mulțumesc.']],
    dialogue: [['Client','Hei! Jeg vil ha en kaffe, takk.','Salut! Doresc o cafea, vă rog.'],['Servitør','Vil du ha et smørbrød?', 'Doriți un sandviș?'],['Client','Ja, takk.','Da, mulțumesc.'],['Servitør','En kaffe og et smørbrød.','O cafea și un sandviș.']],
    grammar:{title:'Articolele Bokmål „en” și „et”',rule:'Substantivele norvegiene au un articol. Pentru un început consecvent în Bokmål folosim „en” și „et”: en kaffe, en kake, et smørbrød.',examples:['en kaffe — o cafea','et smørbrød — un sandviș'],wrong:'Jeg vil ha kaffe en.'},
    exercises:[{type:'choice',prompt:'Care variantă înseamnă „un sandviș”?',options:['En smørbrød','Smørbrød en','Et smørbrød'],answer:2,explanation:'„Smørbrød” se învață împreună cu articolul „et”.'},{type:'fill',prompt:'Completează: „Jeg vil ha ___ kaffe.”',answer:'en',explanation:'Spunem „en kaffe”.'},{type:'order',prompt:'Construiește „Doresc apă”.',words:['vann','ha','Jeg','vil'],answer:['Jeg','vil','ha','vann'],explanation:'Formula de bază este „Jeg vil ha...”.'}],
  },
  {
    id: 3, title: 'În magazin', duration: 20,
    objectives:['să întrebi unde este un produs','să întrebi cât costă','să plătești și să răspunzi despre bon'],
    vocabulary:[['En butikk','Un magazin','Jeg er i en butikk.','Sunt într-un magazin.'],['Unnskyld','Scuzați-mă','Unnskyld, hvor er melken?','Scuzați-mă, unde este laptele?'],['Hvor er...?','Unde este...?', 'Hvor er melken?','Unde este laptele?'],['Hvor mye?','Cât?', 'Hvor mye koster det?','Cât costă?'],['Et kort','Un card','Jeg betaler med kort.','Plătesc cu cardul.'],['En kvittering','Un bon','Vil du ha en kvittering?','Doriți un bon?']],
    dialogue:[['Anna','Unnskyld, hvor er melken?','Scuzați-mă, unde este laptele?'],['Ansatt','Melken er der borte.','Laptele este acolo.'],['Anna','Hvor mye koster det?','Cât costă?'],['Ansatt','Det koster 35 kroner.','Costă 35 de coroane.']],
    grammar:{title:'Întrebări cu „hva” și „hvor”',rule:'„Hva” înseamnă „ce”, „hvor” înseamnă „unde”, iar formula „hvor mye” înseamnă „cât”.',examples:['Hvor er melken? — Unde este laptele?','Hvor mye koster det? — Cât costă?'],wrong:'Hvor koster mye det?'},
    exercises:[{type:'choice',prompt:'Cum întrebi unde este laptele?',options:['Hva er melken?','Hvor er melken?','Hvor mye melk?'],answer:1,explanation:'Pentru loc folosim „hvor”.'},{type:'fill',prompt:'Completează: „Hvor ___ koster det?”',answer:'mye',explanation:'Formula pentru „cât” este „hvor mye”.'},{type:'order',prompt:'Construiește „Plătesc cu cardul”.',words:['kort','med','betaler','Jeg'],answer:['Jeg','betaler','med','kort'],explanation:'„Med kort” înseamnă „cu cardul”.'}],
  },
  {
    id:4,title:'Acasă și rutina zilnică',duration:20,
    objectives:['să descrii o rutină simplă','să formezi prezentul verbelor uzuale','să spui ce nu faci'],
    vocabulary:[['Hjemme','Acasă','Jeg er hjemme.','Sunt acasă.'],['Å stå opp','A se ridica din pat','Jeg står opp klokka sju.','Mă ridic din pat la ora șapte.','står opp'],['Å spise','A mânca','Jeg spiser frokost.','Mănânc micul dejun.','spiser'],['Å jobbe','A lucra','Jeg jobber hjemme.','Lucrez acasă.','jobber'],['Frokost','Mic dejun','Jeg spiser frokost.','Mănânc micul dejun.'],['Middag','Cină','Jeg lager middag.','Pregătesc cina.']],
    dialogue:[['Lars','Står du opp klokka sju?','Te ridici din pat la ora șapte?'],['Anna','Ja, jeg står opp klokka sju.','Da, mă ridic din pat la ora șapte.'],['Lars','Jobber du hjemme?','Lucrezi acasă?'],['Anna','Nei, jeg jobber ikke hjemme.','Nu, nu lucrez acasă.']],
    grammar:{title:'Prezentul și negația „ikke”',rule:'Multe verbe primesc „r” la prezent. Într-o propoziție simplă, „ikke” apare după verb.',examples:['Jeg jobber hjemme. — Lucrez acasă.','Jeg jobber ikke hjemme. — Nu lucrez acasă.'],wrong:'Jeg ikke jobber hjemme.'},
    exercises:[{type:'choice',prompt:'Ce înseamnă „å stå opp”?',options:['A se ridica din pat','A găti','A lucra'],answer:0,explanation:'„Å stå opp” descrie ridicarea din pat; „å våkne” înseamnă a se trezi.'},{type:'fill',prompt:'Completează: „Jeg jobber ___ hjemme i dag.”',answer:'ikke',explanation:'În propoziția simplă, „ikke” apare după verb.'},{type:'order',prompt:'Construiește „Mănânc micul dejun”.',words:['frokost','spiser','Jeg'],answer:['Jeg','spiser','frokost'],explanation:'Ordinea de bază este subiect + verb + restul propoziției.'}],
  },
  {
    id:5,title:'La serviciu',duration:22,
    objectives:['să te prezinți unui coleg','să întrebi despre o întâlnire','să ceri ajutor politicos'],
    vocabulary:[['En jobb','Un serviciu','Jeg er på jobb.','Sunt la serviciu.'],['En kollega','Un coleg','Erik er en kollega.','Erik este un coleg.'],['Et møte','O întâlnire','Møtet er klokka ti.','Întâlnirea este la ora zece.'],['Når?','Când?', 'Når er møtet?','Când este întâlnirea?'],['Å hjelpe','A ajuta','Kan du hjelpe meg?','Poți să mă ajuți?','hjelpe'],['Å sende','A trimite','Kan du sende e-posten?','Poți trimite e-mailul?','sende']],
    dialogue:[['Anna','Hei, jeg heter Anna.','Salut, mă numesc Anna.'],['Erik','Hei, jeg heter Erik.','Salut, mă numesc Erik.'],['Anna','Når er møtet?','Când este întâlnirea?'],['Erik','Møtet er klokka ti. Kan jeg hjelpe deg?', 'Întâlnirea este la ora zece. Pot să te ajut?']],
    grammar:{title:'Verbele modale „kan”, „vil” și „må”',rule:'După „kan”, „vil” și „må”, verbul următor apare fără „å”. Aceste formule sunt foarte utile la serviciu.',examples:['Kan du hjelpe meg? — Poți să mă ajuți?','Jeg må jobbe. — Trebuie să lucrez.'],wrong:'Kan du å hjelpe meg?'},
    exercises:[{type:'choice',prompt:'Cum ceri ajutor politicos?',options:['Du hjelpe meg.','Kan du hjelpe meg?','Jeg hjelp.'],answer:1,explanation:'„Kan du...?” introduce o cerere simplă și politicoasă.'},{type:'fill',prompt:'Completează: „Kan du ___ e-posten?”',answer:'sende',explanation:'După „kan” folosim verbul fără „å”.'},{type:'order',prompt:'Construiește „Întâlnirea este la ora zece”.',words:['ti','Møtet','klokka','er'],answer:['Møtet','er','klokka','ti'],explanation:'Timpul apare după verb: „er klokka ti”.'}],
  },
];

export const courseLessons = [...baseA1Lessons, ...a1ExtraLessons];

export const courseCatalog = {
  A1: { code: 'A1', title: 'Începător', lessons: courseLessons },
  A2: { code: 'A2', title: 'Elementar', lessons: [...a2Lessons, ...a2ExtraLessons] },
  B1: { code: 'B1', title: 'Intermediar', lessons: b1Lessons },
  B2: { code: 'B2', title: 'Avansat', lessons: [...b2Lessons, ...b2ExtraLessons] },
};
