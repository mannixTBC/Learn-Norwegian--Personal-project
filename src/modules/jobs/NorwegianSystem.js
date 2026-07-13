import React from 'react';
import { Link } from 'react-router-dom';
import '../common/Article.css';

const SistemulNorvegian = () => {
  return (
    <article className="articol-stiri">
      <Link to="/joburi" className="articol-stiri__back">
        ← Înapoi la Joburi
      </Link>
      <div className="articol-stiri__card">
        <div className="articol-stiri__header">
          <p className="articol-stiri__meta">Digital · Norvegia vs România</p>
          <h1 className="articol-stiri__title">
            Sistemul norvegian: servicii integrate și identificare digitală
          </h1>
          <p className="articol-stiri__lead">
            În Norvegia, majoritatea serviciilor publice și private sunt integrate digital. Numărul de identificare și BankID sunt baza accesului – iar logica diferă semnificativ de cea din România.
          </p>
        </div>
        <div className="articol-stiri__body">
        <section>
          <h2>Integrarea serviciilor – diferența față de România</h2>
          <p>
            În Norvegia, aproape toate interacțiunile cu statul se fac online: declarații fiscale, asigurări de sănătate, șomaj, alocății, înmatriculări la școală, corespondență oficială. Birourile fizice sunt mult mai puțin folosite decât în România. Ideea este că un singur număr de identificare (personnummer sau D-nummer) și un singur sistem de autentificare (BankID) deschid accesul la toate aceste servicii.
          </p>
          <p>
            În România, suntem obișnuiți cu multiple portaluri (ANAF, CNAS, spital, primărie), fiecare cu propriul cont și proceduri. În Norvegia, ID-Porten (portaliul de servicii publice) și alte platforme folosesc în mare parte aceeași autentificare – BankID. Nu mai trebuie să creezi conturi separate pentru fiecare instituție.
          </p>
          <p>
            Corespondența oficială se primeste în cutia poștală digitală (Digipost sau eBoks): scrisori de la stat, facturi, contracte. În România, încă se folosesc mult documentele fizice și dosarele pe hârtie; în Norvegia, documentul digital are în general aceeași valoare legală ca cel pe hârtie.
          </p>
        </section>

        <section>
          <h2>Personnummer și D-nummer – numărul tău de identificare</h2>
          <p>
            <strong>Personnummer</strong> (fødselsnummer) este numărul norvegian permanent de identificare. Are 11 cifre și conține data nașterii. Este folosit peste tot: la bancă, la angajator, la doctor, la autorități. Fără personnummer, nu poți deschide cont bancar uzual, Înregistrarea în sistemul de sănătate este limitată, și multe servicii digitale nu sunt accesibile.
          </p>
          <p>
            <strong>D-nummer</strong> este numărul temporar pentru cei care lucrează sau stau în Norvegia pe termen scurt. Are aceeași structură ca personnummer, dar prima cifră a datei de naștere este modificată (se adaugă 4). D-nummer îți permite să lucrezi, să plătești taxe, să deschizi cont bancar și să folosești servicii publice, dar accesul la unele servicii poate fi restricționat comparativ cu personnummer.
          </p>
          <p>
            În România, CNP-ul (Codul Numeric Personal) are un rol similar – un singur număr pentru toate instituțiile. Diferența este că în Norvegia acest număr este conectat direct la ecosistemul digital: BankID, ID-Porten, Digipost. În România, integrarea digitală este încă în dezvoltare și multe proceduri rămân pe hârtie sau prin multiple portaluri.
          </p>
        </section>

        <section>
          <h2>BankID – cheia pentru tot</h2>
          <p>
            <strong>BankID</strong> este sistemul principal de identificare electronică în Norvegia. Este oferit de băncile norvegiene și operat centralizat. Peste 4 milioane de norvegieni îl folosesc zilnic pentru bănci, autorități și firme private.
          </p>
          <p>
            Cum funcționează: te identifici pe telefon sau calculator cu aplicația BankID – prin amprentă, recunoaștere facială sau cod PIN. O singură autentificare îți permite să accesezi servicii bancare, declaratii fiscale, sănătate, NAV (șomaj), școli, și multe alte servicii. Nu mai introduci user/parolă pe fiecare site; BankID confirmă identitatea ta.
          </p>
          <p>
            Cum îl obții: BankID se activează la banca unde ai cont. Ai nevoie de personnummer sau D-nummer și de pașaport (sau alt document de identitate recunoscut). Fără cont bancar norvegian, nu poți avea BankID. Dacă ești nou în țară, primul pas este să obții D-nummer, apoi cont bancar, apoi BankID.
          </p>
          <p>
            În România, nu există un echivalent la fel de răspândit. Sistemul național SPV (Semnătură și Parolă de Validare) sau eID sunt folosite în unele proceduri, dar nu sunt integrate la fel de profund în viața de zi cu zi. În Norvegia, fără BankID, ești practic blocat la majoritatea serviciilor online.
          </p>
        </section>

        <section>
          <h2>Digipost și corespondența digitală</h2>
          <p>
            <strong>Digipost</strong> (de la Posten) și <strong>eBoks</strong> sunt cutiile poștale digitale unde primești scrisori oficiale de la stat, facturi, contracte. Statul și multe companii trimit documente aici în loc de poștă clasică. Te înregistrezi cu BankID și ulterior primești notificări când ai mesaje noi.
          </p>
          <p>
            În România, corespondența oficială merge încă mult prin poștă sau trebuie ridicată fizic de la ghișeu. În Norvegia, aproape totul vine digital – trebuie doar să verifici aplicația sau site-ul regulat.
          </p>
        </section>

        <section>
          <h2>Rezumat practic</h2>
          <p>
            Sistemul norvegian se bazează pe: (1) un număr – personnummer sau D-nummer; (2) o cheie digitală – BankID; (3) servicii integrate – ID-Porten, Digipost, bănci, NAV, sănătate. Ordinea este: obții D-nummer → deschizi cont bancar → activezi BankID → accesezi toate serviciile. În România, procedurile sunt mai fragmentate și mai puțin integrate. Pregătește-te pentru o tranziție la o viață aproape complet digitală când te muți în Norvegia.
          </p>
        </section>
        </div>
      </div>
    </article>
  );
};

export default SistemulNorvegian;
