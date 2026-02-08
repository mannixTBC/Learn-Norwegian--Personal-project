import React from 'react';
import { Link } from 'react-router-dom';
import './articol-stiri.css';

const Acte = () => {
  return (
    <article className="articol-stiri">
      <Link to="/joburi" className="articol-stiri__back">
        ← Înapoi la Joburi
      </Link>
      <div className="articol-stiri__card">
        <div className="articol-stiri__header">
          <p className="articol-stiri__meta">Documente · Joburi</p>
          <h1 className="articol-stiri__title">
            Acte necesare pentru lucru în Norvegia
          </h1>
          <p className="articol-stiri__lead">
            Ca cetățean UE/SEE, ai dreptul de a lucra în Norvegia. Iată documentele principale de care ai nevoie pentru a te angaja și a te stabili legal.
          </p>
        </div>
        <div className="articol-stiri__body">
        <section>
          <h2>Documente de identitate</h2>
          <p>
            <strong>Pașaport valabil</strong> sau <strong>carte de identitate</strong> – sunt obligatorii pentru intrarea în Norvegia și pentru toate procedurile ulterioare. Pașaportul este recomandat, deoarece buletinul a cauzat în unele cazuri probleme la anumite instituții. Asigură-te că documentul are valabilitate cel puțin 6 luni.
          </p>
        </section>

        <section>
          <h2>Înregistrare pentru ședere</h2>
          <p>
            Dacă rămâi în Norvegia mai mult de 3 luni, trebuie să te înregistrezi. Cererea se depune online pe site-ul UDI (Direcția Imigrării Norvegiene): <strong>selfservice.udi.no</strong>. După trimitere, trebuie să te prezinți la SUA (Centrul de servicii pentru muncitorii străini) sau la poliție cu documentele depuse. Vei primi un certificat de înregistrare (registreringsbevis) care confirmă dreptul de ședere.
          </p>
          <p>
            Pentru angajați, este necesar contractul de muncă sau un certificat de încadrare în muncă (nu neapărat full-time). Procedura poate dura câteva săptămâni sau luni în orașe mari precum Oslo.
          </p>
        </section>

        <section>
          <h2>D-nummer și Personnummer</h2>
          <p>
            <strong>D-nummer</strong> – număr de identificare temporar pe care îl primești la început. Îți permite să lucrezi, să plătești taxe, să deschizi cont bancar și să închiriezi sau cumperi imobil. Se obține de obicei prin angajator (care cere o carte fiscală – skattekort – de la Skatteetaten), prin NAV (dacă te înregistrezi ca job seeker) sau după înregistrarea la UDI, la un birou fiscal (skattekontor) cu pașaport și contract de muncă.
          </p>
          <p>
            <strong>Personnummer</strong> (sau fødselsnummer) – numărul permanent de identificare norvegian. Îl poți solicita după ce ai primit D-nummer și ți s-a aprobat dreptul de ședere pe termen lung. Este necesar pentru multe servicii publice și pentru angajare pe termen lung.
          </p>
        </section>

        <section>
          <h2>Contract de muncă</h2>
          <p>
            <strong>Contract de muncă</strong> – este esențial pentru înregistrare și pentru obținerea D-nummer. Nu trebuie neapărat să fie full-time; și contracte part-time sau temporare sunt acceptate. Angajatorul trebuie să respecte legislația norvegiană privind condițiile de muncă, salariu și ore de lucru.
          </p>
        </section>

        <section>
          <h2>CV și documente de calificare</h2>
          <p>
            <strong>CV</strong> – adaptat la standardele norvegiene (de obicei pe o pagină, clar, cu experiență și competențe relevante). Mulți angajatori cer CV în limba engleză sau norvegiană.
          </p>
          <p>
            <strong>Diplome și certificate</strong> – pentru unele meserii (medicină, inginerie, învățământ etc.) sunt necesare traduceri autorizate sau echivalare a diplomelor. Verifică pe site-ul Nokut sau la autoritatea competentă din domeniul tău.
          </p>
        </section>

        <section>
          <h2>Alte documente utile</h2>
          <p>
            <strong>Extras de cont bancar</strong> – util dacă nu ai încă un contract de muncă și trebuie să dovedești fonduri suficiente pentru ședere.
          </p>
          <p>
            <strong>Asigurare de sănătate</strong> – ca cetățean UE, ai dreptul la cardul sanitar european pentru șederi scurte. Pentru ședere lungă, te înregistrezi în sistemul norvegian de asigurări de sănătate.
          </p>
          <p>
            <strong>Certificat de căsătorie / acte de familie</strong> – dacă vii cu membri ai familiei, sunt necesare documente care dovedesc relația (certificat de căsătorie, certificat de naștere pentru copii).
          </p>
        </section>

        <section>
          <h2>Rezumat</h2>
          <p>
            Documentele principale de care ai nevoie sunt: pașaport sau carte de identitate valabilă, contract de muncă, înregistrare la UDI (dacă stai mai mult de 3 luni), D-nummer pentru lucru și taxe, CV și eventual diplome cu traduceri. Informațiile oficiale se găsesc pe udi.no și sua.no. Este recomandat să începi procedurile cu cât mai mult timp înainte.
          </p>
        </section>
        </div>
      </div>
    </article>
  );
};

export default Acte;
