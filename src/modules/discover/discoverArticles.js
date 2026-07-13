const articles = {
  fjords: {
    path: '/descopera/fiorduri',
    category: 'Natură · Vestlandet',
    readTime: '7 minute',
    title: 'Fiordurile Norvegiei, acolo unde muntele întâlnește marea',
    lead: 'Nu sunt doar peisaje de bifat. Fiordurile spun povestea ghețarilor, a fermelor agățate de stâncă și a comunităților care au învățat să trăiască între apă și munte.',
    image: 'https://images.unsplash.com/photo-1744619438365-19c55e108cb7?w=1800&q=88&fit=crop',
    imageAlt: 'Un fiord norvegian între munți abrupți',
    factLabel: 'Imaginează-ți',
    fact: 'O vale săpată lent de gheață, apoi umplută de mare. Așa începe povestea unui fiord.',
    stats: [
      { value: '205 km', label: 'lungimea aproximativă a Sognefjordului' },
      { value: '2 situri', label: 'Geirangerfjord și Nærøyfjord, protejate UNESCO' },
      { value: '4 anotimpuri', label: 'patru experiențe complet diferite' },
    ],
    quick: [
      ['Pentru prima vizită', 'Nærøyfjord și Flåm combină vaporul, trenul și traseele într-o călătorie ușor de organizat.'],
      ['Pentru dramatism', 'Geirangerfjord aduce cascade, serpentine și ferme istorice suspendate deasupra apei.'],
      ['Pentru ritm lent', 'Hardangerfjord înseamnă sate, livezi, cidru local și zile petrecute fără grabă.'],
    ],
    sections: [
      {
        number: '01',
        title: 'O sculptură realizată în mii de ani',
        paragraphs: [
          'În timpul erelor glaciare, ghețarii au coborât prin văi și au șlefuit roca sub propria greutate. Când clima s-a încălzit, gheața s-a retras, iar oceanul a pătruns în văile adânci. Pereții abrupți și pragurile submarine pe care le vezi astăzi sunt urmele acestei mișcări lente.',
          'Privit de pe apă, un fiord pare liniștit. De sus, înțelegi adevărata scară: ferme mici, drumuri înguste și cascade care devin fire albe pe versanți uriași.',
        ],
        callout: 'Detaliul care schimbă perspectiva: unele ferme istorice au fost construite la sute de metri deasupra apei, în locuri accesibile cândva doar pe poteci abrupte.',
      },
      {
        number: '02',
        title: 'Patru fiorduri, patru povești',
        paragraphs: [
          'Sognefjord este gigantul: intră adânc în țară și leagă peisaje maritime de ghețari și sate montane. Nærøyfjord este ramura lui îngustă, cu versanți care par să închidă apa. Geirangerfjord impresionează prin cascadele „Cele șapte surori”, „Pețitorul” și „Voalul miresei”. Hardangerfjord este mai blând, cunoscut pentru livezi și pentru apropierea de platoul Hardangervidda.',
          'Nu încerca să le vezi pe toate într-un weekend. Alege un singur areal și lasă loc pentru o croazieră, o drumeție și o dimineață în care să nu ai nimic programat.',
        ],
      },
      {
        number: '03',
        title: 'Cum să le trăiești, nu doar să le fotografiezi',
        paragraphs: [
          'Ia primul vapor al zilei, când apa este liniștită și grupurile sunt mai puține. Coboară într-un sat mic, gustă produse locale și continuă pe jos. În locurile foarte populare, transportul public și rezervările făcute din timp reduc stresul și presiunea asupra comunităților.',
          'Vremea se schimbă repede pe coastă. O geacă impermeabilă, încălțămintea cu aderență și un plan alternativ sunt mai valoroase decât un itinerar rigid.',
        ],
        bullets: ['Verifică legăturile pe Entur înainte de plecare.', 'Păstrează cel puțin o jumătate de zi fără program fix.', 'Nu te apropia de margini pentru fotografia perfectă.'],
      },
    ],
    words: [['fjord', 'fiord'], ['foss', 'cascadă'], ['utsikt', 'priveliște'], ['ferge', 'feribot']],
    sources: [
      ['Visit Norway – Fjord Norway', 'https://www.visitnorway.com/places-to-go/fjord-norway/'],
      ['Visit Norway – Geirangerfjord', 'https://www.visitnorway.com/places-to-go/fjord-norway/the-geirangerfjord/'],
    ],
  },
  aurora: {
    path: '/descopera/aurore-boreale',
    category: 'Experiențe · Nordul Norvegiei',
    readTime: '6 minute',
    title: 'Aurorele boreale: o noapte în care cerul pare viu',
    lead: 'Nordlys nu este un spectacol cu oră fixă. Este o întâlnire între știință, răbdare și acea liniște arctică pe care o simți înainte ca lumina să apară.',
    image: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1800&q=88',
    imageAlt: 'Aurora boreală deasupra unui peisaj arctic',
    factLabel: 'Regula de aur',
    fact: 'Ai nevoie de întuneric, cer senin și răbdare. Activitatea solară singură nu garantează că vei vedea aurora.',
    stats: [
      { value: 'Sep–Mar', label: 'sezonul cu nopți suficient de întunecate' },
      { value: '18–01', label: 'interval frecvent pentru apariții' },
      { value: '0 garanții', label: 'natura decide, chiar și cu prognoză bună' },
    ],
    quick: [
      ['Tromsø', 'Acces ușor, multe tururi și posibilitatea de a urmări ferestrele de cer senin.'],
      ['Lofoten', 'Munți, plaje și sate pescărești care transformă așteptarea într-o experiență.'],
      ['Alta', 'Climat relativ uscat și o cultură solidă a observațiilor aurorale.'],
    ],
    sections: [
      {
        number: '01',
        title: 'De ce dansează lumina',
        paragraphs: [
          'Soarele trimite particule încărcate electric spre Pământ. Câmpul magnetic le ghidează către regiunile polare, unde se ciocnesc cu gazele din atmosfera superioară. Oxigenul produce adesea verdele familiar, iar la alte altitudini pot apărea roșu, violet sau albastru.',
          'Mișcarea pe care o vezi este răspunsul atmosferei la schimbările continue ale vântului solar. Uneori aurora este o bandă palidă; alteori se deschide ca o cortină rapidă peste întregul cer.',
        ],
        callout: 'Camera telefonului poate surprinde culori mai intense decât ochiul. Lasă-ți câteva minute să te adaptezi la întuneric înainte să decizi că „nu se vede nimic”.',
      },
      {
        number: '02',
        title: 'Cum planifici o seară reușită',
        paragraphs: [
          'Caută simultan prognoza norilor și activitatea aurorală. Dacă orașul este acoperit, uneori o deplasare de o oră poate însemna cer senin. Stai departe de iluminatul stradal și acordă experienței mai multe nopți, nu o singură încercare.',
          'Îmbracă-te în straturi, cu lână la bază și protecție împotriva vântului. Bateria telefonului se descarcă mai repede la frig, așa că păstreaz-o aproape de corp și ia un acumulator extern.',
        ],
        bullets: ['Folosește un trepied sau sprijină telefonul pe o suprafață stabilă.', 'Nu aprinde lanterna lângă alți observatori.', 'Alege un loc sigur, departe de trafic și de marginea drumului.'],
      },
      {
        number: '03',
        title: 'Ce rămâne după fotografie',
        paragraphs: [
          'În nord, aurora face parte dintr-un peisaj cultural mai larg: nopți lungi, pescuit, comunități sami și relația atentă cu vremea. O excursie bună nu urmărește doar lumina, ci lasă loc pentru poveștile locului.',
          'Dacă aurora nu apare, noaptea nu este pierdută. Cerul arctic, zgomotul zăpezii și lumina albastră de la marginea zilei sunt experiențe în sine.',
        ],
      },
    ],
    words: [['nordlys', 'auroră boreală'], ['mørketid', 'perioada întunecată'], ['stjerneklar', 'senin, plin de stele'], ['kulde', 'frig']],
    sources: [
      ['Visit Norway – informații despre auroră', 'https://www.visitnorway.com/things-to-do/nature-attractions/northern-lights/facts-about-the-northern-lights/'],
      ['Visit Norway – Lofoten iarna', 'https://www.visitnorway.com/places-to-go/northern-norway/the-lofoten-islands/winter/'],
    ],
  },
  nature: {
    path: '/descopera/dreptul-la-natura',
    category: 'În aer liber · Allemannsretten',
    readTime: '8 minute',
    title: 'Dreptul la natură vine cu o responsabilitate simplă: nu lăsa urme',
    lead: 'Allemannsretten îți oferă libertatea de a merge, de a campa și de a culege în multe zone naturale. Nu este însă un permis fără limite, ci un pact de respect între oameni, proprietari și peisaj.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1800&q=88',
    imageAlt: 'Drumeț într-un peisaj montan vast',
    factLabel: 'Principiul central',
    fact: 'Fii atent, păstrează distanța și lasă locul cel puțin la fel de curat cum l-ai găsit.',
    stats: [
      { value: '150 m', label: 'distanța minimă față de o casă sau cabană locuită' },
      { value: '48 ore', label: 'campare în același loc, de regulă, în zonele joase' },
      { value: '15 apr–15 sep', label: 'perioada cu restricții generale pentru foc lângă pădure' },
    ],
    quick: [
      ['Poți', 'Să mergi pe jos sau pe schiuri în teren necultivat și să culegi fructe de pădure și ciuperci.'],
      ['Întreabă înainte', 'Pentru șederi lungi, grupuri mari sau activități care pot afecta terenul și proprietarul.'],
      ['Oprește-te', 'Dacă deranjezi animale, intri pe teren cultivat ori te apropii prea mult de case.'],
    ],
    sections: [
      {
        number: '01',
        title: 'Unde începe libertatea',
        paragraphs: [
          'Legea face diferența între innmark — curți, teren cultivat și zone apropiate de locuințe — și utmark, adică păduri, munți, mlaștini și mare parte din coastă. Libertatea de acces se aplică în principal în utmark.',
          'Poți traversa pe jos, te poți opri pentru odihnă și poți campa, atât timp cât nu produci pagube și nu deranjezi. Restricțiile locale și regulile ariilor protejate au întotdeauna prioritate.',
        ],
        callout: 'Un loc poate părea „sălbatic”, dar poate fi folosit pentru pășunat, cuibărit sau activități locale. Observă semnele și adaptează-te.',
      },
      {
        number: '02',
        title: 'Campingul fără conflicte',
        paragraphs: [
          'În zonele joase, poți rămâne în același loc până la două nopți fără acord, dacă ești pe teren necultivat și la cel puțin 150 de metri de o casă sau cabană locuită. În munți și zone foarte izolate, șederea poate fi mai lungă, dar bunul-simț rămâne regula principală.',
          'Alege suprafețe rezistente, folosește traseele existente și mută cortul dacă vegetația începe să sufere. Ia cu tine toate deșeurile — inclusiv resturile alimentare și șervețelele biodegradabile.',
        ],
        bullets: ['Nu bloca poteci, porți sau accesul utilajelor.', 'Ține câinele sub control și respectă perioadele obligatorii de lesă.', 'Folosește toaletele existente; în lipsa lor, protejează sursele de apă.'],
      },
      {
        number: '03',
        title: 'Focul, apa și liniștea',
        paragraphs: [
          'Între 15 aprilie și 15 septembrie există o interdicție generală de a aprinde focul în sau lângă pădure, cu excepția situațiilor în care este evident că nu există risc. Pot exista interdicții mai stricte în perioade secetoase, așa că verifică mereu regulile locale.',
          'Nu aprinde foc direct pe stâncă, deoarece căldura o poate fisura. Folosește vetre amenajate, nu tăia arbori vii și stinge complet jarul înainte de plecare.',
        ],
      },
    ],
    words: [['allemannsretten', 'dreptul tuturor'], ['utmark', 'teren necultivat'], ['innmark', 'teren cultivat / zonă privată'], ['bål', 'foc de tabără']],
    sources: [
      ['Norwegian Environment Agency – camping', 'https://www.environmentagency.no/areas-of-activity/right-to-roam/camping/'],
      ['Norwegian Environment Agency – dreptul la acces', 'https://www.environmentagency.no/areas-of-activity/right-to-roam/'],
    ],
  },
  traditions: {
    path: '/descopera/traditii',
    category: 'Cultură · Viața de zi cu zi',
    readTime: '7 minute',
    title: 'Tradiții norvegiene pe care începi să le înțelegi abia când participi',
    lead: 'De la paradele copiilor de 17 mai până la o seară simplă de kos, cultura norvegiană se vede cel mai bine în gesturile care aduc oamenii împreună.',
    image: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1800&q=88',
    imageAlt: 'Stradă norvegiană decorată pentru o sărbătoare',
    factLabel: 'Mai mult decât folclor',
    fact: 'Tradițiile nu sunt doar costume și sărbători. Ele apar în felul în care vecinii muncesc împreună, pleacă la cabană și creează timp pentru kos.',
    stats: [
      { value: '17 mai', label: 'Ziua Constituției și marea sărbătoare a copiilor' },
      { value: 'dugnad', label: 'muncă voluntară făcută pentru comunitate' },
      { value: 'kos', label: 'starea de bine creată intenționat' },
    ],
    quick: [
      ['Participă', 'Acceptă invitația la dugnad sau la o tură în natură — conversațiile vin mai ușor când faceți ceva împreună.'],
      ['Observă', 'Bunadul, mâncarea și obiceiurile diferă de la o regiune la alta; întreabă cu curiozitate.'],
      ['Contribuie', 'La o întâlnire informală, este firesc să aduci ceva și să ajuți la strâns.'],
    ],
    sections: [
      {
        number: '01',
        title: '17 mai: țara văzută prin ochii copiilor',
        paragraphs: [
          'Ziua Constituției marchează adoptarea Constituției din 1814. Spre deosebire de paradele militare, centrul sărbătorii îl reprezintă copiii, fanfarele școlare și comunitățile locale. Străzile se umplu de steaguri, costume regionale și urarea „Gratulerer med dagen!”.',
          'Mulți poartă bunad, un costum care arată legătura cu o regiune sau cu istoria familiei. Ziua începe adesea cu un mic dejun festiv și continuă cu parade, jocuri, hotdogi și multă înghețată.',
        ],
        callout: 'Dacă ești invitat pe 17 mai, îmbracă-te festiv. Nu ai nevoie de bunad; o ținută îngrijită și o atitudine deschisă sunt suficiente.',
      },
      {
        number: '02',
        title: 'Dugnad: comunitatea se construiește făcând',
        paragraphs: [
          'Dugnad este munca voluntară organizată de o asociație, o școală, un club sau un grup de vecini. Poate însemna curățarea curții comune, pregătirea unui eveniment ori întreținerea unui traseu.',
          'Nu este doar o obligație practică. Este una dintre situațiile în care oamenii care nu se cunosc bine ajung să vorbească natural. Pentru cine s-a mutat recent, participarea este o scurtătură către sentimentul de apartenență.',
        ],
      },
      {
        number: '03',
        title: 'Kos, hyttetur și plăcerea lucrurilor simple',
        paragraphs: [
          'Kos descrie o stare de confort și apropiere: lumină caldă, cafea, ceva bun de mâncat și oameni cu care te simți bine. Nu depinde de lux, ci de atenția acordată momentului.',
          'Hyttetur — plecarea la cabană — aduce împreună friluftsliv și kos. Zilele pot însemna schi sau drumeție, iar serile jocuri, mâncare simplă și telefoane lăsate deoparte. Kvikk Lunsj, brunost și vafele apar des, dar adevărata tradiție este ritmul mai lent.',
        ],
        bullets: ['„Takk for sist” se spune când revezi pe cineva după o întâlnire plăcută.', 'Punctualitatea transmite respect pentru timpul celuilalt.', 'Spațiul personal și liniștea nu înseamnă lipsă de prietenie.'],
      },
    ],
    words: [['gratulerer med dagen', 'la mulți ani / felicitări de ziua națională'], ['dugnad', 'muncă voluntară în comunitate'], ['koselig', 'plăcut și confortabil'], ['hyttetur', 'excursie la cabană']],
    sources: [
      ['Norway.no – Ziua Constituției', 'https://www.norway.no/en/croatia/norway/news-events/najvea-roendanska-zabava-u-zemlji/'],
      ['Visit Norway – cultură și tradiții', 'https://www.visitnorway.com/things-to-do/art-culture/'],
    ],
  },
};

export const articleList = Object.keys(articles).map((key) => ({ key, ...articles[key] }));
export default articles;
