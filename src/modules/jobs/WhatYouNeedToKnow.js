import React from 'react';
import { Link } from 'react-router-dom';
import '../common/Article.css';

const CeTrebuieSaStii = () => {
  return (
    <article className="articol-stiri">
      <Link to="/joburi" className="articol-stiri__back">
        ← Înapoi la Joburi
      </Link>
      <div className="articol-stiri__card">
        <div className="articol-stiri__header">
          <p className="articol-stiri__meta">Ghid practic · Norvegia</p>
          <h1 className="articol-stiri__title">
            Ce trebuie să știi înainte să mergi în Norvegia
          </h1>
          <p className="articol-stiri__lead">
            Climat, diferențe între nord și sud, cultura locală și informații utile pentru cei care plănuiesc să lucreze sau să se stabilească în Norvegia.
          </p>
        </div>
        <div className="articol-stiri__body">
        <section>
          <h2>Clima</h2>
          <p>
            Norvegia are un climat temperat oceanic pe coastă și mai rece în interior și nord. 
            Datorită curentului Golfului, coasta vestică rămâne mai caldă decât ar sugera latitudinea, 
            dar ploile sunt frecvente, mai ales în Bergen și zona vestică.
          </p>
          <p>
            <strong>Vara</strong> (iunie–august) este cea mai plăcută perioadă: temperaturi între 15–25°C în sud, 
            zile lungi (în nord poți experimenta soarele de miezul nopții, când soarele nu mai apune). 
            E perioada ideală pentru drumeții, camping, pescuit și explorarea fiordurilor.
          </p>
          <p>
            <strong>Iarna</strong> (decembrie–martie) este dură: frig intens, multă zăpadă și gheață. 
            În nord, solstițiul de iarnă înseamnă noapte polară (mørketid) – săptămâni întregi fără soare. 
            Dimineața și seara sunt întunecoase, ceea ce poate afecta starea de spirit dacă nu ești pregătit. 
            Pe de altă parte, poți vedea aurorele boreale (nordlys), o experiență unică.
          </p>
          <p>
            <strong>Primăvara și toamna</strong> sunt deseori ploioase și vânturoase. Bergen e cunoscută ca 
            „orașul ploii” – un umbrelă sau o jachetă impermeabilă de calitate sunt indispensabile. 
            Vremea poate schimba rapid; chiar și vara, poți trece de la soare la ploaie în câteva ore. 
            Verifică mereu prognoza înainte de trasee lungi în natură.
          </p>
        </section>

        <section>
          <h2>Nord vs Sud</h2>
          <p>
            Norvegia se întinde pe aproximativ 1750 km, de la Stavanger în sud până la Capul Nord. 
            Diferențele între regiuni sunt mari, atât la climat, cât și la oportunități și stil de viață.
          </p>
          <p>
            <strong>Sudul</strong> (Oslo, Bergen, Stavanger, Kristiansand) oferă un climat mai blând, 
            populație mai mare și mai multe locuri de muncă. Infrastructura e bună: trenuri rapide, 
            autostrăzi, aeroporturi și servicii de sănătate. Oslo e centrul economic și cultural; 
            Bergen e porțile către fiorduri; Stavanger e legată de industria petrolieră. 
            Pentru cine vine prima dată sau vrea să se integreze mai ușor, sudul e de obicei alegerea mai potrivită.
          </p>
          <p>
            <strong>Nordul</strong> (Tromsø, Bodø, Lofoten, Finnmark) oferă peisaje spectaculoase: 
            munți, fiorduri, insule și aurore boreale. Dar iernile sunt foarte grele, 
            noaptea polară durează luni, iar costurile (mâncare, transport, utilități) sunt mai mari. 
            Ofertele de muncă sunt mai limitate; economia se bazează pe pescuit, turism și petrol în apele nordice. 
            Statul acordă un „bonus nordic” (nordtillegg) – un supliment la salariu pentru lucrătorii din nord – 
            pentru a compensa condițiile dificile și costurile ridicate.
          </p>
          <p>
            Costul vieții e ridicat în toată Norvegia; Norvegia e una dintre cele mai scumpe țări din Europa. 
            Chirie, mâncare, transport și utilități sunt semnificativ mai scumpe decât în România. 
            În nord, unele produse pot fi și mai scumpe din cauza distanțelor de transport.
          </p>
        </section>

        <section>
          <h2>Cultura norvegiană</h2>
          <p>
            Norvegienii pun preț pe egalitate, simplitate și respect pentru natură. 
            Înțelegerea acestor valori te ajută să te integrezi mai bine.
          </p>
          <p>
            <strong>Egalitarismul</strong> (likestilling) e fundamental: nu există distanță mare între 
            manageri și angajați, și se folosește adesea „du” (tu) în loc de „dere” (dumneavoastră). 
            Titlurile sau gradul nu sunt atât de importante; contează mai mult ce faci decât ce poziție ai. 
            Nu te aștepta la tratament special doar pentru că ai un anumit rol.
          </p>
          <p>
            <strong>Moderația</strong> (jevndøheten) e apreciată: norvegienii evită să se laude excesiv 
            sau să se pună în evidență. E important să fii respectuos, modest și să nu exagerezi. 
            Promisiunile exagerate sau tonul prea entuziast pot fi privite cu suspiciune.
          </p>
          <p>
            <strong>Punctualitatea</strong> e foarte importantă: întâlnirile încep la ora stabilită, 
            iar deadline-urile se respectă. A întârzia fără să anunți e considerat lipsă de respect.
          </p>
          <p>
            <strong>Naturen</strong> (natura) ocupă un loc central în viața norvegienilor: drumeții, 
            schi, pescuit, camping și călătorii în natură sunt activități foarte frecvente. 
            Multe conversații și activități sociale gravitează în jurul naturii. 
            Dacă ești sportiv sau îți place natura, vei găsi rapid subiecte de discuție.
          </p>
          <p>
            <strong>Hygge</strong> (confort, lumină, atmosferă plăcută) e important în viața de acasă: 
            lumânări, lumină caldă, timp petrecut cu familie și prieteni. Multe socializări au loc acasă, 
            nu neapărat în baruri sau restaurante.
          </p>
          <p>
            Norvegienii pot părea rezervați la început – nu înseamnă că sunt neprietenoși. 
            Odată ce te cunosc și simt că te pot încrede, devin calzi și prietenoși. 
            Ajută dacă începi să înveți norvegiana și arăți interes pentru cultura lor.
          </p>
        </section>

        <section>
          <h2>Date generale utile</h2>
          <p>
            <strong>Monedă:</strong> coroană norvegiană (NOK). Nu face parte din zona euro. 
            Cursul variază; în general, 1 EUR ≈ 11–12 NOK. Cardurile sunt acceptate peste tot; 
            numerarul e mai puțin folosit.
          </p>
          <p>
            <strong>Limba:</strong> norvegiană, cu două forme scrise oficiale – bokmål (mai răspândit) 
            și nynorsk (mai mult în vest). Engleza e vorbită foarte bine de majoritatea populației; 
            poți trăi cu engleza, dar pentru integrare și muncă, norvegiana e esențială.
          </p>
          <p>
            <strong>Protește-te de frig:</strong> îmbrăcăminte stratificată (mai multe straturi subțiri), 
            bocanci rezistenți la apă și zăpadă, mănuși, eșarfă și căciulă. În iarnă, 
            temperatura poate scădea până la -20°C sau mai jos în nord.
          </p>
          <p>
            <strong>Transport:</strong> trenurile (NSB/Vy) și autobuzele sunt de calitate bună și punctuale. 
            În nord și în zonele rurale, o mașină poate fi foarte utilă. 
            Ferry-urile sunt frecvente pentru traversarea fiordurilor și insulelor.
          </p>
          <p>
            <strong>Salariu și muncă:</strong> nu există salariu minim legal; salariile se negociază 
            prin convenții colective. În general, salariile sunt ridicate față de România. 
            Programul standard e de 37,5 ore pe săptămână; viața personală e respectată, 
            iar overtime-ul se plătește extra. Sunt obligatorii 25 de zile de concediu plătit pe an.
          </p>
          <p>
            <strong>Siguranță:</strong> Norvegia are una dintre cele mai scăzute rate de criminalitate din lume. 
            Pe străzi te poți simți în siguranță, iar obiectele pierdute sunt adesea returnate proprietarilor.
          </p>
        </section>
        </div>
      </div>
    </article>
  );
};

export default CeTrebuieSaStii;
