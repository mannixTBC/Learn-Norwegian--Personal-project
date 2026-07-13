import { a2Lessons } from './a2Content';
import { b1Lessons } from './b1Content';
import { b2Lessons } from './b2Content';
import { a1ExtraLessons } from './a1ExtraContent';
import { a2ExtraLessons } from './a2ExtraContent';
import { b2ExtraLessons } from './b2ExtraContent';

const baseA1Lessons = [
  {
    id: 1, title: 'Salutări și prezentări', duration: 15,
    objectives: ['să saluți o persoană', 'să spui cum te numești', 'să întrebi pe cineva cum se simte'],
    vocabulary: [
      ['Hei', 'Salut', 'Hei! Hvordan har du det?', 'Salut! Cum te simți?'], ['Takk', 'Mulțumesc', 'Bra, takk.', 'Bine, mulțumesc.'], ['Jeg heter', 'Mă numesc', 'Jeg heter Anna.', 'Mă numesc Anna.'],
      ['Hvordan', 'Cum', 'Hvordan går det?', 'Cum merge?'], ['Bra', 'Bine', 'Jeg har det bra.', 'Sunt bine.'], ['Hyggelig', 'Încântat / plăcut', 'Hyggelig å møte deg!', 'Încântat(ă) de cunoștință!'],
    ],
    dialogue: [['Anna', 'Hei! Hva heter du?', 'Salut! Cum te numești?'], ['Lars', 'Jeg heter Lars. Og du?', 'Mă numesc Lars. Dar tu?'], ['Anna', 'Jeg heter Anna. Hyggelig å møte deg!', 'Mă numesc Anna. Încântată de cunoștință!'], ['Lars', 'Hyggelig å møte deg også!', 'Și eu sunt încântat de cunoștință!']],
    grammar: { title: 'Verbul rămâne la fel', rule: 'În norvegiană, forma verbului nu se schimbă în funcție de persoană.', examples: ['Jeg heter Anna. — Eu mă numesc Anna.', 'Du heter Lars. — Tu te numești Lars.'], wrong: 'Jeg heterer Anna.' },
    exercises: [
      { type:'choice', prompt:'Ce înseamnă „Hyggelig å møte deg”?', options:['La revedere','Încântat de cunoștință','Cu plăcere'], answer:1, explanation:'Expresia se folosește când întâlnești pe cineva pentru prima dată.' },
      { type:'fill', prompt:'Completează: „___ har du det?”', answer:'Hvordan', explanation:'„Hvordan” înseamnă „cum”.' },
      { type:'order', prompt:'Construiește propoziția „Mă numesc Anna”.', words:['Anna','heter','Jeg'], answer:['Jeg','heter','Anna'], explanation:'Ordinea de bază este subiect + verb + nume.' },
    ],
  },
  {
    id: 2, title: 'La cafenea', duration: 18,
    objectives: ['să comanzi o băutură', 'să ceri ceva politicos', 'să înțelegi un preț simplu'],
    vocabulary: [['Kaffe','Cafea','En kaffe, takk.','O cafea, vă rog.'],['Melk','Lapte','Vil du ha melk?','Dorești lapte?'],['Brød','Pâine','Jeg vil ha brød.','Aș dori pâine.'],['Å bestille','A comanda','Jeg vil bestille.','Aș dori să comand.'],['Kroner','Coroane','Det koster 50 kroner.','Costă 50 de coroane.'],['Ha en fin dag','Să ai o zi frumoasă','Takk, ha en fin dag!','Mulțumesc, să ai o zi frumoasă!']],
    dialogue: [['Client','Hei, en kaffe, takk.','Salut, o cafea, vă rog.'],['Servitør','Vil du ha melk?','Doriți lapte?'],['Client','Ja, takk. Hvor mye koster det?','Da, mulțumesc. Cât costă?'],['Servitør','Det blir 45 kroner.','Sunt 45 de coroane.']],
    grammar:{title:'„Vil ha” pentru dorințe',rule:'Folosește „vil ha” când spui că dorești ceva.',examples:['Jeg vil ha kaffe. — Doresc cafea.','Vil du ha melk? — Dorești lapte?'],wrong:'Jeg ha vil kaffe.'},
    exercises:[{type:'choice',prompt:'Cum comanzi politicos o cafea?',options:['Kaffe nå!','En kaffe, takk.','Hvor er kaffe?'],answer:1,explanation:'„Takk” face cererea naturală și politicoasă.'},{type:'fill',prompt:'Completează: „Jeg vil ___ kaffe.”',answer:'ha',explanation:'Construcția corectă este „vil ha”.'},{type:'order',prompt:'Construiește întrebarea „Cât costă?”',words:['det','mye','koster','Hvor'],answer:['Hvor','mye','koster','det'],explanation:'În întrebare, „Hvor mye” apare la început.'}],
  },
  {
    id: 3, title: 'În magazin', duration: 20,
    objectives:['să întrebi unde este un produs','să ceri prețul','să înțelegi întrebarea despre bon'],
    vocabulary:[['Butikk','Magazin','Jeg går til butikken.','Merg la magazin.'],['Unnskyld','Scuzați-mă','Unnskyld, hvor er melken?','Scuzați-mă, unde este laptele?'],['Kvittering','Bon / chitanță','Vil du ha kvittering?','Doriți bonul?'],['Handlekurv','Coș de cumpărături','Varene er i handlekurven.','Produsele sunt în coșul de cumpărături.'],['Hvor mye','Cât','Hvor mye koster det?','Cât costă?'],['Kort','Card','Jeg betaler med kort.','Plătesc cu cardul.']],
    dialogue:[['Anna','Unnskyld, hvor er melken?','Scuzați-mă, unde este laptele?'],['Ansatt','Den er der borte.','Este acolo.'],['Anna','Hvor mye koster den?','Cât costă?'],['Ansatt','Den koster 35 kroner.','Costă 35 de coroane.']],
    grammar:{title:'Întrebări cu „hvor”',rule:'„Hvor” înseamnă „unde”, iar „hvor mye” înseamnă „cât”.',examples:['Hvor er melken? — Unde este laptele?','Hvor mye koster det? — Cât costă?'],wrong:'Hvor koster mye det?'},
    exercises:[{type:'choice',prompt:'Ce înseamnă „kvittering”?',options:['Card','Bon / chitanță','Coș'],answer:1,explanation:'La casă poți auzi „Vil du ha kvittering?”.'},{type:'fill',prompt:'Completează: „___ er melken?”',answer:'Hvor',explanation:'„Hvor” este cuvântul pentru „unde”.'},{type:'order',prompt:'Construiește „Plătesc cu cardul”.',words:['kort','med','betaler','Jeg'],answer:['Jeg','betaler','med','kort'],explanation:'„Med kort” înseamnă „cu cardul”.'}],
  },
  {
    id:4,title:'Acasă și rutina zilnică',duration:20,
    objectives:['să descrii rutina de dimineață','să spui ora unei activități','să vorbești despre locuință'],
    vocabulary:[['Hjemme','Acasă','Jeg er hjemme.','Sunt acasă.'],['Å stå opp','A se trezi','Jeg står opp klokka sju.','Mă trezesc la ora șapte.','står opp'],['Frokost','Mic dejun','Jeg spiser frokost.','Iau micul dejun.'],['Middag','Cină','Jeg lager middag.','Pregătesc cina.'],['Leilighet','Apartament','Jeg bor i en leilighet.','Locuiesc într-un apartament.'],['God natt','Noapte bună','God natt!','Noapte bună!']],
    dialogue:[['Lars','Når står du opp?','Când te trezești?'],['Anna','Jeg står opp klokka sju.','Mă trezesc la ora șapte.'],['Lars','Jobber du hjemme i dag?','Lucrezi acasă astăzi?'],['Anna','Ja, jeg jobber hjemmefra.','Da, lucrez de acasă.']],
    grammar:{title:'Prezentul verbelor',rule:'Multe verbe formează prezentul prin adăugarea literei „r”.',examples:['å jobbe → jobber','å spise → spiser'],wrong:'Jeg å jobbe hjemme.'},
    exercises:[{type:'choice',prompt:'Ce înseamnă „å stå opp”?',options:['A găti','A se trezi','A citi'],answer:1,explanation:'Expresia descrie momentul când te ridici din pat.'},{type:'fill',prompt:'Completează: „Jeg ___ frokost.”',answer:'spiser',explanation:'„Spiser” este prezentul verbului „å spise”.'},{type:'order',prompt:'Construiește „Locuiesc într-un apartament”.',words:['en','Jeg','i','bor','leilighet'],answer:['Jeg','bor','i','en','leilighet'],explanation:'Ordinea este subiect + verb + restul informației.'}],
  },
  {
    id:5,title:'La serviciu',duration:22,
    objectives:['să te prezinți colegilor','să întrebi despre o întâlnire','să formulezi o cerere simplă'],
    vocabulary:[['Jobb','Serviciu','Jeg er på jobb.','Sunt la serviciu.'],['Kollega','Coleg','Hun er min kollega.','Ea este colega mea.'],['Møte','Întâlnire','Møtet er klokka ti.','Întâlnirea este la ora zece.'],['Sjef','Șef','Sjefen er på kontoret.','Șeful este la birou.'],['Å sende','A trimite','Kan du sende e-posten?','Poți trimite e-mailul?'],['Helg','Weekend','Ha en fin helg!','Să ai un weekend plăcut!']],
    dialogue:[['Anna','Hei, jeg er den nye.','Salut, sunt noua colegă.'],['Kollega','Velkommen! Jeg heter Erik.','Bine ai venit! Mă numesc Erik.'],['Anna','Når er møtet?','Când este întâlnirea?'],['Kollega','Møtet er klokka ti.','Întâlnirea este la ora zece.']],
    grammar:{title:'Cereri cu „kan du”',rule:'Folosește „Kan du...?” pentru a cere politicos cuiva să facă ceva.',examples:['Kan du hjelpe meg? — Poți să mă ajuți?','Kan du sende e-posten? — Poți trimite e-mailul?'],wrong:'Du kan sende e-posten?'},
    exercises:[{type:'choice',prompt:'Ce înseamnă „møte”?',options:['Pauză','Întâlnire','Mesaj'],answer:1,explanation:'„Et møte” este o întâlnire de lucru.'},{type:'fill',prompt:'Completează: „___ du hjelpe meg?”',answer:'Kan',explanation:'„Kan du...?” introduce o cerere politicoasă.'},{type:'order',prompt:'Construiește „Întâlnirea este la ora zece”.',words:['ti','Møtet','klokka','er'],answer:['Møtet','er','klokka','ti'],explanation:'Timpul apare după verb: „er klokka ti”.'}],
  },
];

export const courseLessons = [...baseA1Lessons, ...a1ExtraLessons];

export const courseCatalog = {
  A1: { code: 'A1', title: 'Începător', lessons: courseLessons },
  A2: { code: 'A2', title: 'Elementar', lessons: [...a2Lessons, ...a2ExtraLessons] },
  B1: { code: 'B1', title: 'Intermediar', lessons: b1Lessons },
  B2: { code: 'B2', title: 'Avansat', lessons: [...b2Lessons, ...b2ExtraLessons] },
};
