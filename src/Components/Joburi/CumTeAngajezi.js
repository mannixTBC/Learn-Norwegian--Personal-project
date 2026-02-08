import React from 'react';
import { Link } from 'react-router-dom';
import './articol-stiri.css';

const CumTeAngajezi = () => {
  return (
    <article className="articol-stiri">
      <Link to="/joburi" className="articol-stiri__back">
        ← Înapoi la Joburi
      </Link>
      <div className="articol-stiri__card">
        <div className="articol-stiri__header">
          <p className="articol-stiri__meta">Ghid angajare · Norvegia</p>
          <h1 className="articol-stiri__title">
            Cum te angajezi în Norvegia
          </h1>
          <p className="articol-stiri__lead">
            Acte necesare, site-uri de joburi, tipuri de contracte și meserii foarte căutate în funcție de sezon și regiune – tot ce ai nevoie pentru a găsi de lucru în Norvegia.
          </p>
        </div>
        <div className="articol-stiri__body">
        <section>
          <h2>Acte necesare pentru angajare</h2>
          <p>
            Înainte de a aplica, asigură-te că ai documentele în ordine. Ca cetățean UE/SEE, ai dreptul de a lucra în Norvegia. Iată ce îți trebuie:
          </p>
          <ul>
            <li><strong>Pașaport valabil</strong> sau carte de identitate – obligatoriu pentru intrare și înregistrare</li>
            <li><strong>Contract de muncă</strong> – esențial pentru obținerea D-nummer și înregistrarea la UDI</li>
            <li><strong>CV</strong> – adaptat la standardele norvegiene (clar, pe o pagină, în engleză sau norvegiană)</li>
            <li><strong>D-nummer</strong> – număr de identificare temporar, obținut la început; îți permite să lucrezi și să plătești taxe</li>
            <li><strong>Personnummer</strong> – pentru ședere lungă, după ce îți se aprobă dreptul de ședere</li>
          </ul>
          <p>
            Pentru detalii complete despre documente, vezi secțiunea <Link to="/joburi/acte" className="articol-stiri__link">Acte</Link>.
          </p>
        </section>

        <section>
          <h2>Site-uri unde găsești joburi în Norvegia</h2>
          <p>
            Norvegienii folosesc în mare parte site-uri și platforme digitale pentru recrutare. Iată cele mai importante:
          </p>
          <ul>
            <li><strong>Finn.no</strong> – cel mai mare site de anunțuri din Norvegia. Secțiunea „Jobb” (Joburi) agregă oferte din toată țara. Poți filtra pe oraș, domeniu și tip de contract. Mult folosit atât de angajatori mici, cât și de mari companii.</li>
            <li><strong>NAV.no</strong> – site-ul oficial al Agenției pentru Muncă și Bunăstare. Ofere liste de joburi, programe de înscriere ca job seeker și informații despre drepturi. Dacă te înregistrezi, primești recomandări personalizate.</li>
            <li><strong>LinkedIn</strong> – foarte utilizat în sectorul IT, finanțe, consultanță și corporații internaționale. Multe firme norvegiene publică oferte aici.</li>
            <li><strong>Indeed.no</strong> – agregator de anunțuri, strânge oferte de pe multiple surse.</li>
            <li><strong>Arbeidsplassen.no</strong> – portalul oficial NAV pentru joburi. Mai multe posturi în sectorul public și de stat.</li>
            <li><strong>StepStone.no</strong> – popular în Europa, și în Norvegia există oferte, mai ales în domenii corporatiste.</li>
          </ul>
          <p>
            Sfat: Creează un profil pe Finn și NAV, setează alerte pentru cuvinte cheie din domeniul tău și verifică zilnic. Multe firme postează și pe propriile site-uri – dacă știi compania, merită să verifici direct secțiunea „Karriere” sau „Ledige stillinger”.
          </p>
        </section>

        <section>
          <h2>Tipuri de contract de muncă</h2>
          <p>
            Legislatia norvegiană recunoaște mai multe forme de angajare. Înțelegerea lor te ajută să știi la ce să te aștepți:
          </p>
          <ul>
            <li><strong>Fast ansatt</strong> (angajat permanent) – contract pe nedeterminat. Cel mai stabil, cu drepturi complete: concediu plătit (minimum 25 zile/an), protecție la concediere, pensie de stat. Angajatorul poate înceta contractul doar în anumite condiții (reducere de personal, încălcare gravă etc.).</li>
            <li><strong>Midlertidig ansettelse</strong> (angajare temporară) – contract pe termen determinat. Poate dura luni sau ani, dar are o dată de încheiere. Util pentru sezonieri, înlocuiri sau proiecte. Drepturile sunt similare cu cele ale angajaților permanenți în perioada contractului.</li>
            <li><strong>Deltid</strong> (part-time) – ore reduse (ex. 50%, 80%). Frecvent în comerț, sănătate, ospătărie. Drepturile sunt proporționale cu orele lucrate.</li>
            <li><strong>Vikariat</strong> (sublocuire) – înlocuiești temporar un angajat absent. Contract scurt, de obicei câteva săptămâni sau luni.</li>
            <li><strong>Sommerjobb / sesongarbeid</strong> (job de vară / sezonier) – tipic pentru agricultură, turism, pescuit. De obicei primăvară–toamnă. Mulți români lucrează în pescuit sau în hotele din nord în sezon.</li>
          </ul>
        </section>

        <section>
          <h2>Joburi foarte căutate – pe sezon și zonă</h2>
          <p>
            Cererea de muncă variază mult în funcție de regiune și perioadă. Iată o orientare generală:
          </p>

          <h3>Vara (mai–septembrie)</h3>
          <ul>
            <li><strong>Turism și ospătărie</strong> – hotele, restaurante, cabane din fiorduri și pe coastă (Bergen, Geiranger, Lofoten, Tromsø) angajează masiv. Ospătari, bucătari, personal de curățenie.</li>
            <li><strong>Agricultură și horticultură</strong> – cules de fructe, legume, flori în sud și vest. Multe ferme angajează muncitori străini.</li>
            <li><strong>Pescuit și procesare pește</strong> – în nord (Lofoten, Finnmark) și pe coasta de vest. Sezonul de cod și pește proaspăt atrage mii de lucrători.</li>
            <li><strong>Construcții</strong> – lucrările de exterior se intensifică; cerere pentru muncitori calificați.</li>
          </ul>

          <h3>Iarna (noiembrie–martie)</h3>
          <ul>
            <li><strong>Stațiuni de schi</strong> – Trysil, Hemsedal, Norefjell etc. Instructori, barmani, personal de recepție.</li>
            <li><strong>Vedere aurore boreale</strong> – în nord (Tromsø, Alta, Lofoten). Ghizi, personal în hosteluri și turism de experiență.</li>
            <li><strong>Pescuit de crab</strong> – în nord, de la sfârșitul toamnei până în primăvară. Foarte bine plătit, dar greu fizic.</li>
          </ul>

          <h3>Pe regiuni</h3>
          <ul>
            <li><strong>Oslo și regiunea</strong> – IT, finanțe, consultanță, sănătate, învățământ. Multe corporații și startup-uri. Competiție mare, dar și salarii ridicate.</li>
            <li><strong>Stavanger</strong> – industria petrolieră (offshore, engineering, logistică). Cerere fluctuantă cu prețul petrolului.</li>
            <li><strong>Bergen</strong> – turism, comerț marin, servicii. Oferte constante în ospătărie și logistică.</li>
            <li><strong>Nord (Tromsø, Bodø, Lofoten, Finnmark)</strong> – pescuit, turism (vară și iarnă), construcții. Salarii mai mari decât în sud pentru compensarea condițiilor grele.</li>
            <li><strong>Sud (Kristiansand, Arendal)</strong> – industrie, servicii, turism de coastă.</li>
          </ul>
        </section>

        <section>
          <h2>Rezumat</h2>
          <p>
            Pentru a te angaja în Norvegia: pregătește documentele (pașaport, CV, contract), creează profile pe <strong>Finn.no</strong> și <strong>NAV</strong>, aplică și pentru joburi temporare sau sezoniere dacă vrei să începi rapid. Învață elemente de norvegiană – deși mulți angajatori acceptă engleza, limba locală deschide mai multe uși. Verifică constant ofertele pe site-urile menționate și nu ezita să contactezi direct firmele care te interesează.
          </p>
        </section>
        </div>
      </div>
    </article>
  );
};

export default CumTeAngajezi;
