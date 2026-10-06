# Taskuri pentru restructurarea variantei web

Acest document centralizează modificările propuse în urma analizei variantei web. Observațiile noi pot fi adăugate aici înainte de următoarea etapă majoră de implementare.

## 1. Crearea profilului și alegerea direcției

### Obiectiv

Fiecare utilizator autentificat trebuie să primească de la început un curs adaptat scopului său profesional sau personal.

### Taskuri

- După prima autentificare sau după crearea contului, utilizatorul este trimis automat la pagina de alegere a direcției.
- Alegerea direcției devine un pas obligatoriu pentru configurarea inițială a profilului.
- Direcțiile disponibile trebuie prezentate clar, prin denumiri și pictograme expresive.
- Direcția selectată se salvează în profilul utilizatorului din Supabase.
- După salvare, utilizatorul este trimis către cursul sau dashboardul său.
- La autentificările următoare, pagina de alegere nu mai apare dacă profilul este deja configurat.
- Utilizatorul poate schimba ulterior direcția din pagina „Profil”.
- Trebuie definit un comportament potrivit pentru vizitatorii anonimi: salvare locală și posibilitatea alegerii direcției fără cont.

### Situații care trebuie verificate

- Utilizator nou autentificat cu Google.
- Utilizator nou creat cu e-mail și parolă.
- Utilizator existent care are deja o direcție salvată.
- Vizitator anonim.
- Utilizator care întrerupe configurarea și revine ulterior.

## 2. Restructurarea paginii „Învață”

### Obiectiv

Pagina trebuie să îi arate utilizatorului imediat ce are de făcut în continuare, fără o listă lungă de niveluri, lecții sau recomandări.

### Taskuri

- În zona principală se afișează un singur card: lecția curentă sau următoarea lecție recomandată.
- Cardul trebuie să includă:
  - nivelul curent, de exemplu `A1`;
  - numărul lecției;
  - titlul lecției, de exemplu „Salutări și prezentări”;
  - progresul realizat în interiorul lecției;
  - durata estimată;
  - direcția aleasă de utilizator;
  - un mesaj scurt care explică modul în care lecția este adaptată direcției sale.
- Dacă lecția a fost începută, cardul trebuie să indice clar punctul în care a rămas utilizatorul, de exemplu „Continuă de la conversație”.
- Lecțiile finalizate și structura completă a cursului pot rămâne într-o zonă secundară, accesibilă printr-un buton discret precum „Vezi programa”.
- Eliminarea secțiunii „Recomandat pentru tine” trebuie evaluată după realizarea noului card principal. Dacă informația este deja inclusă în card, secțiunea se elimină.
- Layoutul trebuie să funcționeze bine atât pe desktop, cât și pe telefon, păstrând un singur obiectiv principal vizibil.

### Variante de formulare pentru adaptarea lecției

- „Adaptată pentru Transport și logistică”
- „Cu situații practice din Transport și logistică”
- „Exemple aplicate în Transport și logistică”
- „Norvegiană pentru activitatea ta în Transport și logistică”
- „Lecție personalizată pentru Transport și logistică”

Varianta recomandată pentru început este: **„Cu situații practice din Transport și logistică”**. Este ușor de înțeles și explică concret ce se schimbă în lecție.

## 3. Acțiunile lecțiilor

### Obiectiv

Toate acțiunile trebuie să arate ca butoane adevărate, să folosească termeni consecvenți și să indice clar ce se va întâmpla.

### Taskuri

- Înlocuirea linkului „Deschide” cu un buton principal.
- Folosirea unui text diferit în funcție de starea lecției:
  - `Începe lecția` pentru o lecție care nu a fost începută;
  - `Continuă lecția` pentru o lecție începută;
  - `Recapitulează` pentru o lecție finalizată.
- Butonul trebuie să aibă aceeași identitate vizuală pe pagina „Învață”, în dashboard și în programa cursului.
- Eliminarea sublinierii și a culorii implicite de link în toate stările.
- Adăugarea unor stări vizuale clare pentru hover, focus, apăsare și dezactivare.
- Verificarea accesibilității: contrast bun, focus vizibil și zonă de apăsare suficient de mare.

### Pasul 2 – Vocabular

- Eliminarea traducerii din titlul secțiunii „Vocabular”.
- Traducerea nu trebuie repetată în titlu deoarece este deja afișată în conținutul de mai jos.
- Titlul trebuie să rămână scurt și curat, concentrat pe cuvântul sau expresia în limba norvegiană.
- Verificarea tuturor lecțiilor și nivelurilor pentru ca această regulă să fie aplicată consecvent.

### Criteriu de acceptare

La pasul 2 al fiecărei lecții, titlul vocabularului nu mai repetă traducerea care apare deja în zona explicativă de dedesubt.

## 4. Restructurarea paginii „Viața în Norvegia”

### Obiectiv

Pagina trebuie să ofere acces rapid la articole și categorii, cu mai puțin spațiu consumat înainte ca utilizatorul să ajungă la conținut.

### Taskuri

- Micșorarea zonei introductive și a primelor carduri.
- Reducerea înălțimii imaginilor și a spațiilor verticale excesive.
- Eliminarea textelor introductive care repetă informații deja evidente din titluri.
- Organizarea articolelor pe două coloane în varianta desktop.
- Păstrarea unei singure coloane pe telefon.
- Folosirea unor carduri mai compacte, cu:
  - imagine;
  - categorie;
  - titlu;
  - rezumat de maximum două sau trei rânduri;
  - timp estimat de citire;
  - acțiune clară pentru deschiderea articolului.
- Gruparea sau filtrarea articolelor pe categorii, de exemplu:
  - muncă și acte;
  - locuință;
  - sănătate;
  - familie și educație;
  - cultură și tradiții;
  - natură și timp liber.
- Adăugarea unui filtru compact sau a unor categorii orizontale în partea de sus, dacă numărul articolelor justifică acest lucru.
- Evidențierea unui singur articol important, nu a mai multor carduri mari simultan.
- Verificarea lungimii paginii după restructurare și reducerea scrollului inutil.

## 5. Curățarea paginilor principale

### Obiectiv

Fiecare pagină trebuie să aibă un scop evident și o singură acțiune principală.

### Taskuri

- Inventarierea tuturor secțiunilor de pe pagina principală, dashboard, „Învață” și „Viața în Norvegia”.
- Eliminarea conținutului care repetă aceeași informație în mai multe locuri.
- Eliminarea cardurilor decorative care nu ajută utilizatorul să ia o decizie sau să continue învățarea.
- Reducerea numărului de stiluri diferite de carduri și butoane.
- Păstrarea unei ierarhii simple: titlu, explicație scurtă, acțiune principală și conținut secundar.
- Folosirea spațiului liber pentru separarea secțiunilor, fără chenare suplimentare inutile.
- Menținerea conținutului important deasupra zonei vizibile inițial, în special progresul și butonul de continuare.

## 6. Profilul utilizatorului pe telefon

### Problemă observată

În varianta pentru telefon, pe pagina „Profil” nu apare secțiunea „Recapitularea greșelilor”. Utilizatorul nu poate vedea sau accesa ușor greșelile salvate pentru recapitulare.

### Taskuri

- Identificarea regulii responsive sau a condiției care ascunde secțiunea pe ecranele mici.
- Afișarea secțiunii „Recapitularea greșelilor” și pe telefon.
- Integrarea secțiunii fără a încărca excesiv partea superioară a profilului.
- Păstrarea progresului și a butonului principal pentru continuarea lecției înaintea secțiunii de recapitulare.
- Folosirea unui card compact, cu numărul greșelilor disponibile și o acțiune clară `Recapitulează`.
- Afișarea unei stări goale simple atunci când utilizatorul nu are greșeli salvate.
- Verificarea secțiunii pentru utilizatori autentificați și vizitatori anonimi.

### Criteriu de acceptare

Pe telefon, utilizatorul găsește în pagina „Profil” secțiunea „Recapitularea greșelilor” și poate începe recapitularea fără să treacă la varianta desktop.

## 7. Decizii de produs care trebuie stabilite

- Direcția este obligatorie și pentru vizitatorii anonimi sau doar pentru utilizatorii cu cont?
- Ce direcție implicită primește un utilizator care nu alege una?
- Pagina „Învață” va afișa exclusiv lecția curentă sau și un acces secundar către întreaga programă?
- Secțiunea „Recomandat pentru tine” se elimină complet sau informația ei este integrată în cardul lecției?
- Ce articol va fi evidențiat pe pagina „Viața în Norvegia” și după ce criteriu?
- Categoriile articolelor vor fi filtre, taburi sau simple secțiuni?

## 8. Ordinea recomandată pentru implementare

1. Salvarea direcției în profil și redirecționarea utilizatorului nou.
2. Stabilirea sursei unice pentru progresul lecției și direcția aleasă.
3. Crearea noului card principal de pe pagina „Învață”.
4. Standardizarea butoanelor și a textelor lor.
5. Eliminarea secțiunilor redundante de pe pagina „Învață”.
6. Restructurarea paginii „Viața în Norvegia”.
7. Repararea și adaptarea secțiunii „Recapitularea greșelilor” din profilul mobil.
8. Curățarea generală a paginilor și verificarea responsive.
9. Testarea fluxului complet pe desktop și telefon.

## 9. Criterii de acceptare

- Un utilizator nou își poate alege direcția fără confuzie.
- Direcția rămâne salvată după delogare și autentificare ulterioară.
- Pagina „Învață” arată imediat lecția care trebuie continuată.
- Utilizatorul poate înțelege din card titlul, progresul și adaptarea profesională a lecției.
- Textul butonului corespunde stării reale a lecției.
- Pe desktop, articolele din „Viața în Norvegia” sunt afișate pe două coloane.
- Pe telefon, cardurile sunt compacte, lizibile și nu produc scroll orizontal.
- Pe telefon, profilul afișează secțiunea „Recapitularea greșelilor” și permite accesarea ei.
- Nu există informații sau acțiuni principale repetate pe aceeași pagină.
- Toate butoanele au contrast bun, focus vizibil și comportament consecvent.

## 10. Principii pentru un design curat și eficient

### Un singur obiectiv principal pe ecran

Utilizatorul trebuie să înțeleagă în câteva secunde ce poate face în continuare. Acțiunea principală trebuie să fie mai vizibilă decât elementele secundare.

### Mai puține carduri, cu roluri mai clare

Un card trebuie folosit doar atunci când grupează informații care aparțin împreună. Dacă fiecare text este pus într-un card, pagina devine fragmentată și mai greu de parcurs.

### Ierarhie vizuală consecventă

Titlurile, subtitlurile, textele și etichetele trebuie să aibă niveluri vizuale stabile. Este recomandată folosirea unui număr redus de dimensiuni și grosimi ale fontului.

### Texte scurte și concrete

Interfața trebuie să spună ce se întâmplă, nu să descrie inutil pagina. De exemplu, „Continuă lecția” este mai eficient decât „Deschide pagina pentru a continua procesul de învățare”.

### Acțiuni denumite după rezultat

Folosește „Începe lecția”, „Continuă lecția” și „Recapitulează”, în locul unor termeni generici precum „Deschide”, „Vezi” sau „Accesează”.

### Spațiu liber, nu chenare în exces

Separarea prin distanță și aliniere produce un aspect mai modern decât folosirea multor contururi, umbre și fundaluri diferite.

### O paletă restrânsă

Este suficientă o culoare principală pentru acțiuni, una secundară pentru informații și culori neutre pentru fundal și text. Culorile intense trebuie rezervate elementelor importante.

### Conținut progresiv

Arată mai întâi informația necesară pentru următoarea acțiune. Programa completă, statisticile detaliate și opțiunile rare pot fi accesibile secundar.

### Consecvență între pagini

Același tip de acțiune trebuie să folosească același stil și aceeași formulare peste tot. Utilizatorul nu ar trebui să reînvețe interfața pe fiecare pagină.

### Design pornit de la conținut

Dimensiunea cardurilor trebuie stabilită în funcție de informația necesară, nu invers. Textele nu trebuie adăugate doar pentru a umple spațiul disponibil.

### Verificare pe dispozitive reale

După fiecare schimbare majoră trebuie verificat fluxul complet pe desktop și pe telefon: autentificare, alegerea direcției, continuarea lecției, navigarea și citirea unui articol.
