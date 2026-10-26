// Editorial generator for 200 situations / 1200 CEFR variants; preserves the ten original contracts.
// Run from any directory with node scripts/expand-conversation-catalog.cjs.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const specs = [];
// Fields: ID, title, roles, brief, opening, report, request, options,
// A2 question/answer, B2 constraint/challenge, C1 handoff, C2 ambiguity/reformulation.
function group(direction, rows) {
  for (const row of rows) {
    if (row.length !== 15) throw new Error('Editorial field count: ' + row[0]);
    const [id,title,roles,brief,opening,report,request,options,question,answer,constraint,challenge,handoff,ambiguous,precise] = row;
    specs.push({path:direction,id,title,roles,brief,opening,report,request,options,question,answer,constraint,challenge,handoff,ambiguous,precise});
  }
}
group('transport', [
['bus-ticket','Biletul nu se afișează','Ești șoferul. Nora este pasagera.','Autobuzul este oprit. Nora spune că a cumpărat bilet, dar acesta nu apare în aplicație. Nu poți confirma plata. Cere-i să încerce din nou aplicația.','Hei, billetten min vises ikke. Kan du hjelpe?','Billetten vises ikke i appen.','Kan du åpne appen på nytt?','Puteți redeschide aplicația sau cere verificarea cumpărării de către serviciul clienți. Nu sunt specificate reguli privind continuarea călătoriei.','Vil du prøve appen igjen først?','Ja, jeg kan prøve én gang til.','Pasagera se grăbește. Plata nu poate fi considerată confirmată doar pentru că este solicitată o verificare.','Jeg har dårlig tid. Kan du bare si at billetten er betalt?','Du prøver appen, og jeg forklarer alternativene. Hvis billetten fortsatt mangler, kan du kontakte kundeservice.','kjøpet er sjekket','Kjøpet kan undersøkes, men betalingen er ikke bekreftet.'],
['bus-lost-bag','Un rucsac uitat în autobuz','Ești șoferul. Nora este dispecera.','După terminarea cursei ai găsit un rucsac albastru în autobuz. Proprietarul este necunoscut. Cere înregistrarea lui fără să verifici conținutul.','Hei! Hva vil du melde fra om?','Jeg fant en blå sekk på bussen etter turen.','Kan du registrere sekken?','Dispecera poate înregistra descrierea acum sau puteți reveni cu detalii la depou. Predarea se face la depou; ora sosirii nu este cunoscută.','Hvor skal jeg levere sekken?','Du kan levere den på depotet.','Dispecera dorește o oră exactă pentru predare, dar ora sosirii la depou nu este cunoscută.','Kan du love et bestemt klokkeslett for leveringen?','Jeg leverer sekken og sier fra når jeg er på depotet. Du registrerer beskrivelsen.','sekken er levert tilbake','Sekken skal leveres på depotet; den er ikke levert tilbake til eieren.'],
['bus-stop-question','La ce stație cobor?','Ești șoferul. Nora este pasagera.','Autobuzul este oprit. Pasagera merge la bibliotecă. În acest traseu fictiv, Biblioteket este următoarea stație. Nu cunoști drumul de la stație la intrare. Oferă să anunți stația.','Hei, jeg skal til biblioteket. Hvor går jeg av?','Biblioteket er neste holdeplass.','Vil du at jeg skal si fra ved holdeplassen?','Pasagera poate urmări afișajul sau șoferul poate anunța stația Biblioteket. Nu sunt cunoscute alte linii ori distanța până la intrare.','Er det Biblioteket du vil gå av på?','Ja, det er der jeg vil gå av.','Pasagera cere o garanție că stația este chiar în fața intrării; acest detaliu nu este cunoscut.','Er stoppet helt sikkert rett foran inngangen?','Jeg sier fra ved Biblioteket. Du går av der og sjekker veien til inngangen.','du er framme','Du er framme ved holdeplassen Biblioteket, ikke nødvendigvis ved inngangen.']
]);
group('hospitality', [
['hotel-towels','Lipsesc prosoapele','Ești oaspetele camerei 204. Nora este recepționera.','În camera fictivă 204 lipsesc două prosoape. Solicită două prosoape curate.','Hei! Hva kan jeg hjelpe deg med?','Det mangler to håndklær på rom 204.','Kan jeg få to rene håndklær?','Poți lua prosoapele de la recepție acum sau aștepta livrarea după ce personalul devine disponibil. Ora livrării nu este cunoscută.','Kan jeg hente dem i resepsjonen nå?','Ja, de er klare her.','Ai nevoie de prosoape curând, dar livrarea în cinci minute nu poate fi garantată.','Vi kan ikke love levering om fem minutter. Hva foretrekker du?','Jeg henter håndklærne i resepsjonen, og du legger dem klare.','håndklærne er klare','Håndklærne er klare i resepsjonen, men de er ikke levert til rommet.'],
['hotel-room-noise','Zgomot pe hol','Ești oaspetele camerei 204. Nora este recepționera.','Auzi zgomot de pe hol în camera fictivă 204 și nu te poți odihni. Nu cunoști sursa exactă. Cere verificarea zgomotului.','Hei! Hvordan kan jeg hjelpe?','Det er mye støy fra gangen ved rom 204.','Kan dere undersøke støyen?','Recepția poate cere verificarea holului sau poate verifica disponibilitatea altei camere. O cameră alternativă nu este confirmată.','Kan dere sjekke gangen først?','Ja, vi kan be en kollega sjekke gangen.','Nu se poate promite mutarea înainte de verificarea disponibilității.','Vi vet ikke om et annet rom er ledig. Hva gjør vi først?','Du ber en kollega sjekke gangen. Jeg sier fra hvis støyen fortsetter.','rombyttet er ordnet','Dere undersøker et mulig rombytte; et nytt rom er ikke bekreftet.'],
['hotel-luggage','Bagajul după check-out','Ești oaspetele. Nora este recepționera.','Ai făcut check-out și vrei să lași un geamantan la hotel până la ora 16. Cere păstrarea temporară.','Hei! Er det noe mer du trenger?','Jeg har sjekket ut og vil hente kofferten klokka fire.','Kan dere oppbevare kofferten?','Hotelul poate păstra geamantanul până la 16 sau îl poți lua acum. Predarea și ridicarea sunt la recepție. Nu este specificat un tarif.','Henter jeg kofferten i resepsjonen?','Ja, du henter den her.','Programul tău se poate schimba, dar păstrarea după 16 nu este confirmată.','Vi har avtalt oppbevaring til fire. Hva hvis du blir senere?','Du tar imot kofferten. Jeg henter den innen fire og kontakter dere før det hvis planen endres.','bagasjen er hentet','Bagasjen er levert til oppbevaring, men jeg har ikke hentet den ennå.']
]);
group('office', [
['office-meeting-time','Mutăm ședința','Ești colegul Norei.','Ai două ședințe suprapuse la ora 10. Cere mutarea discuției cu Nora.','Hei! Passer møtet klokka ti?','Jeg har to møter samtidig klokka ti.','Kan vi flytte møtet vårt?','Tu și Nora sunteți disponibili la 13 astăzi sau la 9 mâine. Disponibilitatea altor colegi nu este cunoscută.','Passer klokka tretten i dag for deg?','Ja, det passer for meg.','Nora vrea să confirme pentru toată echipa, dar ceilalți nu au răspuns.','Kan vi si at hele teamet har bekreftet?','Jeg oppdaterer invitasjonen etter at vi har avtalt tiden. Du sjekker med de andre.','møtet er bekreftet','Tidspunktet passer for oss to; resten av teamet har ikke bekreftet.'],
['office-file-access','Nu pot deschide fișierul','Ești colegul Norei; ea coordonează documentul.','Nu poți deschide documentul Raport. Apare mesajul «acces refuzat». Cauza tehnică este necunoscută. Cere verificarea accesului.','Hei! Får du åpnet dokumentet?','Jeg får ikke åpnet Rapport. Det står at jeg ikke har tilgang.','Kan du sjekke tilgangen min?','Nora poate verifica permisiunile sau puteți cere ajutor suportului intern. Nu trimiteți parole și nu folosiți contul altcuiva.','Skal jeg sende deg feilmeldingen?','Ja, send selve feilmeldingen, uten passord.','Nora propune să închideți problema, dar accesul nu a fost retestat și nu există un termen de rezolvare.','Kan vi regne problemet som løst nå?','Jeg sender feilmeldingen og prøver igjen etterpå. Du sjekker tillatelsene og gir beskjed.','tilgangen er ordnet','Tilgangen blir undersøkt; jeg må teste før vi vet at den fungerer.'],
['office-handover','Predarea sarcinii înainte de liber','Ești colegul Norei.','Mâine ești liber. Ciorna raportului este pregătită, dar un tabel nu este verificat. Cere Norei să preia verificarea.','Hei! Hva må følges opp mens du har fri?','Utkastet er klart, men tabellen er ikke sjekket. Jeg har fri i morgen.','Kan du sjekke tabellen?','Poți lăsa o notă scrisă sau face acum o scurtă predare verbală. Raportul nu trebuie trimis înainte de verificarea tabelului.','Vil du ha en skriftlig oversikt?','Ja, en kort oversikt er fint.','Nora vrea să trimită raportul imediat, deși tabelul nu este verificat.','Kan jeg sende rapporten med en gang?','Jeg markerer tabellen i notatet. Du sjekker den før rapporten sendes.','rapporten er ferdig','Utkastet er ferdig, men tabellen må sjekkes før rapporten kan sendes.']
]);
group('general', [
['general-parcel','Ridicarea unui colet','Ești clientul. Nora lucrează la punctul de ridicare.','Ai notificarea pentru un colet și codul fictiv TEST42. Cere căutarea coletului. Nu folosi date personale reale.','Hei! Skal du hente en pakke?','Jeg har fått melding om en pakke. Hentekoden er TEST42.','Kan du finne pakken?','Nora poate căuta după cod sau verifica notificarea împreună cu tine. Acesta este punctul corect în exercițiu. Nu sunt specificate alte reguli de identificare.','Er dette riktig hentested?','Ja, dette er riktig hentested.','Notificarea există, dar coletul nu a fost găsit fizic.','Kan vi markere pakken som hentet før jeg finner den?','Jeg viser koden, og du leter etter pakken. Vi bekrefter henting først når pakken er overlevert.','pakken er klar','Meldingen sier at pakken er klar; den er ikke overlevert til meg ennå.'],
['general-neighbor-noise','O discuție cu vecina','Ești vecinul Norei.','Muzica din apartamentul Norei se aude în camera ta. Ai nevoie de odihnă. Cere reducerea volumului.','Hei! Er det noe du vil snakke om?','Jeg hører musikken din inne hos meg, og jeg trenger å hvile.','Kan du skru ned musikken?','Nora poate reduce volumul sau folosi căști acum. Nu sunt precizate ore legale de liniște sau sancțiuni.','Kan du gjøre det nå?','Ja, jeg kan gjøre det nå.','Nora dorește să continue să asculte muzică, iar tu ai nevoie de odihnă.','Jeg vil gjerne fortsette å høre på musikk. Hva foreslår du?','Du demper musikken, og jeg sier fra hvis den fortsatt høres godt.','nå er det stille','Volumet er redusert; jeg må sjekke om musikken fortsatt høres hos meg.'],
['general-hair-appointment','Schimbarea unei programări','Ești clientul. Nora lucrează la salon.','Nu mai poți ajunge la programarea fictivă de marți, ora 14. Solicită reprogramarea.','Hei! Hva gjelder det?','Jeg kan ikke komme til timen tirsdag klokka fjorten.','Kan vi flytte timen?','Salonul oferă miercuri la 10 sau joi la 16. Nu sunt specificate taxe ori alte intervale.','Er torsdag klokka seksten ledig?','Ja, den timen er ledig.','Nu există un interval seara în afara celor două opțiuni oferite.','Vi har bare disse to tidene. Hvilken løsning passer best?','Jeg velger torsdag klokka seksten. Du endrer timen og bekrefter tidspunktet.','timen er avlyst','Den gamle timen erstattes av en ny avtale; jeg ønsker ikke å avlyse hele besøket.']
]);


group('construction', [
['site-tool-missing','Unealta lipsește','Ești muncitorul. Nora coordonează echipa.','Mașina de găurit de care ai nevoie nu este în dulap. Nu știi cine a luat-o. Cere ajutor pentru găsirea unei unelte potrivite.','Hei! Hvordan går det med oppgaven?','Drillen er ikke i skapet. Jeg vet ikke hvor den er.','Kan du hjelpe meg å finne en drill?','Puteți verifica registrul de unelte sau întreba echipa. Nu este confirmată o unealtă de rezervă. Nu folosiți echipament nepotrivit.','Skal vi sjekke verktøylisten først?','Ja, vi kan begynne med listen.','Nora vrea să începi imediat, dar unealta potrivită nu a fost găsită.','Kan du starte før vi har funnet riktig verktøy?','Jeg sjekker listen, og du spør teamet. Jeg starter når riktig verktøy er tilgjengelig.','verktøyet er tilgjengelig','Vi undersøker hvor verktøyet er; det er ikke klart til bruk ennå.'],
['site-instructions','Clarificarea unei sarcini','Ești muncitorul. Nora coordonează echipa.','Ai primit instrucțiunea de a muta cutiile, dar nu știi în ce zonă. Cere clarificarea destinației înainte să începi.','Hei! Har du spørsmål om flyttingen?','Jeg vet ikke hvilken sone kassene skal til.','Kan du vise meg riktig sone?','În exercițiu, cutiile merg în zona B. Nora poate arăta zona sau o poate indica pe plan. Nu sunt descrise tehnici de ridicare ori greutăți.','Er det sone B du mener?','Ja, det er sone B.','Nora se grăbește și ar vrea să începi fără să verificați dacă vorbiți despre aceeași zonă.','Kan du bare begynne uten at vi ser på sonen sammen?','Du viser sone B på planen, og jeg bekrefter plasseringen før jeg begynner.','flytt dem dit','Med «dit» mener vi sone B som er markert på planen, ikke området ved inngangen.'],
['site-delivery-count','Lipsesc două cutii','Ești muncitorul care primește livrarea. Nora coordonează livrările.','În comanda fictivă sunt zece cutii, dar la livrare ai numărat opt. Cere verificarea diferenței.','Hei! Stemmer leveringen?','Vi bestilte ti kasser, men jeg teller åtte.','Kan du sjekke de to kassene som mangler?','Puteți renumăra cutiile sau verifica lista de livrare. Nu se cunoaște locul celor două cutii lipsă ori momentul unei completări.','Skal vi telle en gang til først?','Ja, la oss telle en gang til.','Nora ar vrea să marcheze livrarea completă, deși diferența nu este rezolvată.','Kan vi registrere hele leveringen som komplett nå?','Jeg teller kassene på nytt, og du sjekker listen. Vi registrerer avviket hvis det fortsatt mangler to.','leveringen er mottatt','Åtte kasser er mottatt; hele bestillingen på ti er ikke bekreftet levert.']
]);
group('healthcare', [
['care-visit-time','Ora vizitei','Ești persoana care programează o vizită neclinică. Nora este la recepție.','Vrei o vizită de sprijin pentru mâine, dar nu poți la ora 10. Cere un alt interval. Nu discuta simptome sau tratamente.','Hei! Passer besøket klokka ti i morgen?','Jeg kan ikke ta imot besøket klokka ti i morgen.','Kan vi avtale et annet tidspunkt?','În exercițiu, recepția oferă ora 13 sau 15 mâine. Programarea este pentru o vizită de sprijin neclinică; nu sunt alte intervale confirmate.','Er klokka tretten mulig?','Ja, tretten er ledig.','Recepția nu poate oferi un interval suplimentar dimineața.','Vi har bare tretten og femten. Hvilken tid fungerer best?','Jeg velger tretten. Du oppdaterer avtalen og bekrefter tidspunktet.','besøket er gjennomført','Tidspunktet er avtalt, men besøket har ikke funnet sted ennå.'],
['care-water-request','Un pahar cu apă','Ești persoana asistată. Nora oferă sprijin neclinic.','Vrei un pahar cu apă la temperatura camerei. Apa nu este încă adusă. Formulează cererea; nu este un exercițiu de tratament medical.','Hei! Er det noe du trenger?','Jeg ønsker vann som ikke er kaldt.','Kan jeg få et glass vann?','În această situație fictivă este disponibilă apă la temperatura camerei. Nora poate aduce un pahar acum sau îl poate pregăti pentru mai târziu. Nu sunt discutate restricții medicale.','Kan du sette glasset på bordet ved siden av meg?','Ja, jeg kan sette det på bordet.','Nora propune apă rece, deși preferi apa la temperatura camerei.','Vil du heller ha kaldt vann?','Du setter vannet på bordet, og jeg sier fra hvis jeg trenger noe mer.','vannet er tatt','Vannet er satt fram, men jeg har ikke sagt at jeg har drukket det.'],
['care-room-air','Aerisim camera','Ești persoana asistată. Nora oferă sprijin neclinic.','În cameră ți se pare prea cald. Vrei puțin aer proaspăt. Cere ajutor fără să soliciți o procedură medicală.','Hei! Hvordan er det i rommet?','Det er for varmt for meg her inne.','Kan vi lufte litt?','În exercițiu se poate deschide puțin fereastra sau ușa pentru scurt timp. Nora rămâne disponibilă să le închidă. Nu există o temperatură măsurată.','Kan vinduet stå litt åpent en kort stund?','Ja, jeg kan åpne det litt.','Nora propune să lase fereastra larg deschisă, dar tu dorești doar puțin aer, pentru scurt timp.','Skal jeg la vinduet stå helt åpent?','Du åpner vinduet litt. Jeg sier fra når jeg vil at du skal lukke det.','rommet er passe varmt','Vi har begynt å lufte; jeg må kjenne etter før jeg kan si at temperaturen passer.']
]);
group('cleaning', [
['cleaning-occupied-room','Camera este ocupată','Ești responsabil de curățenie. Nora coordonează programul.','Camera 12 este încă ocupată, deși apare în lista ta de curățenie. Cere o schimbare a ordinii.','Hei! Hvordan ligger du an med rommene?','Rom tolv er fortsatt opptatt.','Kan vi endre rekkefølgen?','Poți începe cu camera 14, care este liberă, sau poți reveni la 12 după confirmarea eliberării. Nu intra fără acord și nu inventa ora eliberării.','Er rom fjorten ledig nå?','Ja, rom fjorten er ledig.','Nora vrea o oră exactă pentru finalizarea camerei 12, dar eliberarea nu este confirmată.','Kan du love når rom tolv er ferdig?','Jeg begynner med fjorten. Du gir beskjed når tolv er ledig, så oppdaterer jeg planen.','rommet er klart','Rommet kan være ledig, men det er ikke dermed ferdig rengjort.'],
['cleaning-supplies','Lipsesc lavetele curate','Ești responsabil de curățenie. Nora coordonează materialele.','Nu mai ai lavete curate pentru următoarea cameră. Cere un set nou.','Hei! Har du det du trenger?','Jeg har ikke flere rene kluter.','Kan jeg få nye kluter?','Există lavete curate în depozit. Le poți lua tu sau Nora poate organiza aducerea lor; ora livrării nu este stabilită. Nu sunt oferite instrucțiuni pentru amestecarea produselor.','Kan jeg hente kluter på lageret?','Ja, det er rene kluter der.','Nora propune să continui fără setul curat; tu ai nevoie de el pentru următoarea cameră.','Kan du fortsette før du får rene kluter?','Jeg henter rene kluter. Du bekrefter hvor de ligger, og jeg sier fra hvis de ikke er der.','utstyret er på plass','Klutene finnes på lageret; de er ikke hentet til arbeidsstedet ennå.'],
['cleaning-spill','O pată pe hol','Ești responsabil de curățenie. Nora coordonează clădirea.','Ai observat o băutură vărsată pe hol, lângă recepție. Cere coordonarea curățării și informării colegilor. Nu sunt răniți în acest scenariu.','Hei! Hva vil du melde fra om?','Det er sølt drikke i gangen ved resepsjonen.','Kan du hjelpe med å koordinere rengjøringen?','Poți prelua curățarea dacă Nora informează colegii sau Nora poate solicita echipa disponibilă. Urmați procedura locală, fără a inventa instrucțiuni tehnice.','Kan du varsle kollegene ved resepsjonen?','Ja, jeg kan varsle dem.','Nora dorește să anunțe imediat că holul este gata, dar curățarea nu a fost verificată.','Kan jeg melde at gangen er klar allerede nå?','Jeg følger opp rengjøringen. Du varsler kollegene, og vi gir klarsignal først etter kontroll.','gangen er tatt','Rengjøringen er satt i gang; gangen er ikke bekreftet klar ennå.']
]);
group('retail', [
['shop-find-product','Unde găsesc produsul?','Ești clientul. Nora lucrează în magazin.','Cauți orez, dar nu îl găsești pe raftul la care te-ai uitat. Cere indicații.','Hei! Leter du etter noe?','Jeg finner ikke risen.','Kan du vise meg hvor risen står?','În magazinul fictiv, orezul este pe culoarul 3. Nora poate arăta direcția sau te poate însoți până la raft. Stocul exact nu este verificat.','Er det i gang tre?','Ja, det er i gang tre.','Nora știe locul obișnuit, dar nu poate garanta că produsul este în stoc înainte să verifice.','Kan vi være sikre på at det er ris igjen uten å sjekke?','Du viser meg riktig hylle, og jeg ser etter varen. Hvis den mangler, ber vi om en lagerkontroll.','varen er tilgjengelig','Vi vet hvor varen vanligvis står; lagerbeholdningen er ikke bekreftet.'],
['shop-price-label','Prețul de pe raft','Ești clientul. Nora lucrează la casă.','Eticheta arată 30 de coroane pentru produs, dar la casă apare 35. Cere verificarea diferenței, fără să presupui ce preț trebuie aplicat.','Hei! Var det noe med prisen?','På hyllen står det tretti kroner, men her står det trettifem.','Kan du sjekke prisen?','Nora poate verifica eticheta sau cere verificarea de către un coleg. Nu este stabilit ce preț este corect ori dacă există o reducere.','Kan vi se på etiketten sammen?','Ja, vi kan sjekke etiketten.','Verificarea nu s-a încheiat și prețul final nu este confirmat.','Kan du godta trettifem før vi har undersøkt forskjellen?','Du sjekker etiketten, og jeg venter med å bekrefte kjøpet til prisen er avklart.','prisen er rettet','Prisforskjellen blir undersøkt; en ny pris er ikke bekreftet ennå.'],
['shop-receipt','Bonul nu a ieșit','Ești clientul. Nora lucrează la casă.','După cumpărături nu ai primit bonul. În acest exercițiu plata este confirmată la casă. Cere bonul.','Hei! Trenger du noe mer?','Jeg fikk ikke kvitteringen.','Kan jeg få kvitteringen?', 'Nora poate încerca să imprime bonul din nou sau poate cere ajutorul unui coleg dacă imprimanta nu răspunde. Nu se solicită o nouă plată și nu sunt necesare date bancare.','Kan du skrive den ut på nytt?','Ja, jeg kan prøve å skrive den ut igjen.','Imprimanta nu răspunde momentan, deși plata este confirmată.','Skriveren svarer ikke. Kan du vente mens jeg ber en kollega om hjelp?','Du prøver utskriften og kontakter en kollega hvis den ikke virker. Jeg venter ved kassen.','kjøpet må gjøres på nytt','Det er kvitteringen som må skrives ut på nytt, ikke betalingen.']
]);
group('studies', [
['study-library-book','Prelungirea împrumutului','Ești studentul. Nora este bibliotecara.','Ai cartea fictivă Norsk i praksis și vrei să o păstrezi mai mult. Termenul curent este mâine. Cere verificarea posibilității de prelungire.','Hei! Hva kan jeg hjelpe med?','Boka Norsk i praksis skal leveres i morgen.','Kan jeg fornye lånet?','Nora poate verifica dacă prelungirea este posibilă sau poți returna cartea până la termen. Nu sunt cunoscute rezervări, taxe ori o nouă dată-limită.','Kan du sjekke om boka er reservert?','Ja, jeg kan undersøke det, men jeg vet ikke svaret ennå.','Prelungirea nu este confirmată înainte de verificare.','Kan vi si at fristen er forlenget før jeg har sjekket?','Du undersøker om lånet kan fornyes. Jeg beholder den gamle fristen til du bekrefter noe annet.','lånet er fornyet','Fornyelse er forespurt; den opprinnelige fristen gjelder inntil noe annet er bekreftet.'],
['study-assignment','Ce trebuie să predau?','Ești studentul. Nora este profesoara.','Ai notat că trebuie să predai un rezumat, dar nu ai înțeles formatul. Cere clarificarea sarcinii.','Hei! Har du spørsmål om oppgaven?','Jeg er usikker på formatet til sammendraget.','Kan du forklare hva vi skal levere?','În această sarcină fictivă se cere un rezumat scris de o pagină. Poți cere un exemplu de structură sau poți rezuma tu cerința pentru verificare. Termenul nu este specificat.','Skal sammendraget være én side?','Ja, én skriftlig side.','Nora vrea să se asigure că nu confunzi o prezentare orală cu rezumatul scris.','Mener du at du skal holde en muntlig presentasjon?','Du bekrefter formatet, og jeg lager et skriftlig sammendrag på én side. Jeg spør separat om fristen.','oppgaven er levert','Kravene til oppgaven er avklart; selve teksten er ikke levert ennå.'],
['study-group-roles','Împărțim proiectul','Ești studentul. Nora este colega de proiect.','Proiectul vostru are nevoie de o introducere și de două exemple. Încă nu ați împărțit sarcinile. Propune o împărțire.','Hei! Hvordan skal vi dele arbeidet?','Vi trenger en innledning og to eksempler.','Kan vi dele oppgavene?','Poți pregăti introducerea și Nora exemplele sau invers. Amândoi puteți face o verificare comună după ciorne. Nu este stabilit un termen calendaristic.','Vil du ta eksemplene?','Ja, jeg kan ta eksemplene.','Nora se teme că exemplele vor cere mai mult lucru decât introducerea.','Eksemplene kan ta mer tid. Hvordan kan vi dele arbeidet rettferdig?','Jeg lager innledningen, og du finner eksemplene. Vi ser på arbeidsmengden sammen når utkastene er klare.','prosjektet er klart','Oppgavene er fordelt; prosjektet er ikke ferdig før delene er skrevet og gjennomgått.']
]);
group('family', [
['family-pickup-delay','Întârzii la grădiniță','Ești părintele. Nora lucrează la grădiniță.','Întârzii aproximativ zece minute la ridicarea copilului fictiv Alex din cauza traficului. Anunță și cere să stabiliți următoarea actualizare. Nu folosi date reale.','Hei, barnehagen her. Hva gjelder det?','Jeg blir omtrent ti minutter forsinket på grunn av trafikken.','Kan vi avtale hvordan jeg gir beskjed videre?','Poți oferi acum estimarea sau poți reveni cu actualizare când ai informații mai clare și poți comunica în siguranță. Nu sunt precizate ora închiderii, taxe sau persoane autorizate suplimentare.','Skal jeg ringe igjen hvis forsinkelsen endrer seg?','Ja, gi beskjed hvis anslaget endrer seg.','Nora dorește o oră exactă, dar traficul face ca estimarea să rămână incertă.','Kan du love et helt nøyaktig tidspunkt?','Jeg gir et nytt anslag når jeg har sikre opplysninger og kan kontakte dere trygt. Du gir beskjeden videre til teamet.','hentingen er ordnet','Forsinkelsen er meldt; barnet er ikke hentet ennå, og tidspunktet er fortsatt et anslag.'],
['family-spare-clothes','Hainele de schimb','Ești părintele. Nora lucrează la grădiniță.','Copilul fictiv Alex nu mai are pantaloni de schimb în dulăpior. Cere să stabiliți cum aduci o pereche curată.','Hei! Har du et spørsmål om skiftetøyet?','Alex har ikke flere skiftebukser i skapet.','Kan vi avtale når jeg leverer en ren bukse?','Poți aduce pantalonii la ridicarea de astăzi sau mâine dimineață. În exercițiu există haine de rezervă pentru moment. Nu se cer mărimi ori date reale.','Er det greit at jeg tar dem med i morgen tidlig?','Ja, det går fint i denne situasjonen.','Nora vrea să marcheze dulăpiorul ca aprovizionat înainte ca hainele să fie aduse.','Kan jeg notere at skiftetøyet allerede er på plass?','Jeg tar med en ren bukse i morgen tidlig. Du sjekker at den blir lagt i skapet.','klærne er ordnet','Vi har avtalt å ta med klær; de ligger ikke i skapet ennå.'],
['family-parent-meeting','Programarea discuției cu educatoarea','Ești părintele. Nora este educatoarea.','Vrei o discuție scurtă despre cum se acomodează copilul fictiv Alex. Cere programarea unei întâlniri, fără să inventezi probleme sau diagnostice.','Hei! Hva vil du gjerne avtale?','Jeg vil gjerne snakke om hvordan Alex trives.','Kan vi avtale en kort samtale?','Nora poate discuta marți la 15 sau joi la 9. Nu sunt stabilite alte intervale sau concluzii despre copil.','Passer torsdag klokka ni?','Ja, torsdag klokka ni passer.','Nora propune o discuție completă imediat pe hol, dar subiectul merită un cadru liniștit.','Kan vi bare ta hele samtalen her i gangen nå?','Jeg kommer torsdag klokka ni og forbereder spørsmål. Du setter av tid til samtalen.','samtalen er tatt','Tidspunktet er avtalt; selve samtalen om trivsel har ikke funnet sted.']
]);


const comparisons = [
'Vi kan prøve appen igjen eller kontakte kundeservice. Jeg foreslår appen først fordi vi kan prøve det nå.',
'Vi kan registrere sekken nå eller gi flere detaljer på depotet. Jeg vil registrere den nå så funnet er kjent.',
'Du kan følge skjermen eller få beskjed av meg. Jeg kan si fra så du vet hvilket stopp du skal av på.',
'Jeg kan hente håndklærne eller vente på levering. Jeg henter dem fordi jeg trenger dem snart.',
'Vi kan sjekke gangen eller undersøke et annet rom. Jeg foreslår gangen først fordi vi ikke vet om andre rom er ledige.',
'Jeg kan ta kofferten med eller la den stå her. Jeg vil la den stå til fire fordi jeg vil slippe å bære den.',
'Vi kan møtes i dag klokka tretten eller i morgen klokka ni. Jeg foretrekker i dag så vi kan komme videre.',
'Vi kan sjekke tillatelsene eller kontakte intern støtte. La oss sjekke tilgangen først fordi feilmeldingen gjelder tilgang.',
'Vi kan snakke sammen nå eller skrive et notat. Jeg foretrekker et notat så du har oversikten i morgen.',
'Vi kan søke på koden eller se på meldingen sammen. La oss bruke koden først fordi jeg har den her.',
'Du kan skru ned eller bruke hodetelefoner. Hodetelefoner passer best fordi du kan fortsette mens jeg hviler.',
'Jeg kan komme onsdag klokka ti eller torsdag klokka seksten. Jeg velger torsdag fordi det passer bedre for meg.',
'Vi kan sjekke listen eller spørre teamet. Jeg vil sjekke listen først fordi verktøyet kan være registrert der.',
'Du kan vise meg sonen eller peke på planen. Jeg foretrekker planen fordi vi kan kontrollere plasseringen sammen.',
'Vi kan telle på nytt eller sjekke leveringslisten. La oss telle først for å kontrollere antallet.',
'Jeg kan velge tretten eller femten. Jeg foretrekker tretten fordi det passer bedre for meg.',
'Jeg kan få vannet nå eller senere. Jeg ønsker det nå fordi jeg gjerne vil ha noe å drikke.',
'Vi kan åpne døren eller vinduet litt. Jeg velger vinduet fordi jeg ønsker litt frisk luft.',
'Jeg kan begynne med fjorten eller vente på tolv. Jeg begynner med fjorten fordi det rommet er ledig.',
'Jeg kan hente kluter selv eller vente på levering. Jeg henter dem fordi jeg trenger dem før neste rom.',
'Jeg kan følge opp rengjøringen eller vi kan be et ledig team gjøre det. Jeg tar oppfølgingen hvis du varsler kollegene.',
'Du kan vise retningen eller bli med til hyllen. Jeg vil gjerne at du viser meg hyllen så jeg finner riktig sted.',
'Vi kan sjekke etiketten sammen eller be en kollega. Jeg foreslår at vi ser sammen så vi kan sammenligne prisene.',
'Vi kan prøve utskriften igjen eller be en kollega. La oss prøve én gang til før vi ber om hjelp.',
'Jeg kan be om fornyelse eller levere i morgen. Jeg ønsker fornyelse fordi jeg vil lese mer, men må få det bekreftet.',
'Jeg kan be om et eksempel eller gjenta kravet med egne ord. Jeg vil gjenta det så vi kan sjekke at jeg har forstått.',
'Jeg kan skrive innledningen og du finne eksempler, eller omvendt. Jeg foreslår at jeg tar innledningen fordi jeg vil øve på den.',
'Jeg kan gi anslaget nå eller vente på sikrere opplysninger. Jeg gir anslaget nå så dere vet at jeg blir forsinket.',
'Jeg kan levere buksen i dag eller i morgen tidlig. Jeg velger i morgen fordi det passer bedre og dere har reserveklær nå.',
'Vi kan møtes tirsdag klokka femten eller torsdag klokka ni. Jeg velger torsdag fordi det passer bedre for meg.'
];
const responses = [
'Jeg forstår at du har dårlig tid, men jeg kan ikke bekrefte betalingen. Vi kan be kundeservice undersøke kjøpet.',
'Jeg vet ikke når jeg er på depotet, så jeg kan ikke love en tid. Jeg sier fra når jeg kommer fram.',
'Jeg vet bare at Biblioteket er neste stopp. Jeg kan si fra der, men kan ikke love hvor inngangen er.',
'Da henter jeg dem selv, siden dere ikke kan love rask levering.',
'La oss sjekke gangen først. Vi kan undersøke et annet rom hvis støyen fortsetter, uten å love et rombytte.',
'Jeg henter innen fire. Hvis planen endres, kontakter jeg dere før det for å spørre hva som er mulig.',
'Vi kan bekrefte for oss to, men må spørre de andre før vi bekrefter for hele teamet.',
'Nei, vi må teste først. Du sjekker tillatelsene, og så prøver jeg igjen.',
'Ikke ennå. Tabellen må sjekkes først, ellers sender vi en rapport som ikke er kontrollert.',
'Ikke før pakken er overlevert. La oss finne den først så registreringen blir riktig.',
'Du kan gjerne fortsette med hodetelefoner. Da kan jeg hvile uten at du må slutte å høre på musikk.',
'Da velger jeg torsdag klokka seksten, siden dere ikke har en senere tid.',
'Jeg trenger riktig verktøy før jeg starter. La oss sjekke listen først.',
'Jeg vil gjerne sjekke sonen på planen først, så kassene kommer til riktig sted.',
'Ikke ennå. Vi teller på nytt og registrerer forskjellen hvis det fortsatt bare er åtte.',
'Da velger jeg tretten, siden det ikke er noen ledig tid om morgenen.',
'Nei takk, jeg foretrekker vann som ikke er kaldt. Kan du ta vann med romtemperatur?',
'Bare litt åpent, takk. Jeg ønsker frisk luft en kort stund, ikke et helt åpent vindu.',
'Jeg kan ikke love en tid før rommet er ledig. Jeg begynner med fjorten og oppdaterer planen etterpå.',
'Jeg trenger rene kluter først. Jeg henter dem på lageret før jeg fortsetter med neste rom.',
'Vi må kontrollere gangen først. Du kan varsle om arbeidet nå og gi klarsignal etter kontrollen.',
'Nei, vi kjenner bare plasseringen. La oss se på hyllen før vi sier at varen er på lager.',
'Jeg vil gjerne avklare forskjellen før jeg bekrefter kjøpet. Kan vi sjekke etiketten først?',
'Ja, jeg kan vente mens du ber om hjelp. Betalingen er bekreftet, så det er bare utskriften vi trenger.',
'Ikke før det er sjekket. Jeg forholder meg til den gamle fristen hvis fornyelsen ikke blir bekreftet.',
'Nei, jeg skal levere en skriftlig side. Jeg gjentar kravet så vi er enige om formatet.',
'Jeg kan hjelpe med gjennomgangen av eksemplene etter innledningen. Da kan vi fordele arbeidet på nytt hvis det blir skjevt.',
'Det er et anslag, ikke et løfte. Jeg gir beskjed hvis forsinkelsen endrer seg og jeg kan kontakte dere trygt.',
'Ikke ennå. Jeg tar med buksen i morgen, og da kan vi bekrefte at den ligger i skapet.',
'Jeg vil heller avtale et rolig tidspunkt. Vi kan møtes torsdag klokka ni og snakke ordentlig da.'
];
const clarifications = [
'Verifică dacă pasagera vrea să reîncerce aplicația','Întreabă unde predai rucsacul','Verifică stația la care pasagera dorește să coboare',
'Verifică ridicarea prosoapelor de la recepție','Cere verificarea holului mai întâi','Verifică locul de ridicare a bagajului',
'Verifică disponibilitatea Norei la ora propusă','Întreabă dacă trimiți mesajul de eroare','Verifică forma preferată pentru predare',
'Verifică punctul de ridicare','Verifică dacă volumul poate fi redus acum','Verifică noul interval',
'Întreabă dacă verificați mai întâi registrul','Verifică destinația cutiilor','Propune renumărarea cutiilor',
'Verifică disponibilitatea la ora 13','Clarifică locul în care să fie pus paharul','Verifică deschiderea parțială a ferestrei',
'Verifică disponibilitatea camerei 14','Întreabă dacă poți lua lavete din depozit','Cere informarea colegilor de la recepție',
'Verifică numărul culoarului','Propune verificarea etichetei împreună','Cere o nouă încercare de imprimare',
'Cere verificarea unei eventuale rezervări','Verifică lungimea rezumatului scris','Verifică dacă Nora preia exemplele',
'Clarifică dacă revii când estimarea se schimbă','Verifică dacă poți aduce hainele mâine','Verifică intervalul de joi'
];
const places = {transport:'Transport · Situație practică',hospitality:'Hotel · Recepție',office:'Birou · Colegi',general:'Viața de zi cu zi',construction:'Șantier · Echipa',healthcare:'Sprijin și îngrijire · Comunicare',cleaning:'Curățenie · Organizare',retail:'Magazin · Clienți',studies:'Studii · Organizare',family:'Familie · Grădiniță'};
const turns = {A1:7,A2:8,B1:9,B2:10,C1:10,C2:10};
const languageTemplates = JSON.parse(fs.readFileSync(path.join(root,'backend/scenarios/cafe-order.levels.json'),'utf8'));
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const write = (name, text) => fs.writeFileSync(path.join(root,name),text,'utf8');
const json = (name,data) => write(name,JSON.stringify(data,null,2)+'\n');
const catalogPath = 'src/modules/exercises/conversationScenarios.json';
const catalog = JSON.parse(read(catalogPath));
const reject = ['A greeting or bare yes without relevant prior context is insufficient.', 'Invented facts, repeating the partner without the required communicative act, and unresolved contradictions do not satisfy the criterion.'];
const fact = (id,value,knownTo='shared') => ({id,value,knownTo,disclosure:knownTo==='learner'
  ? 'This is learner background, not spoken evidence. Do not disclose learner-only information before it is reported. Ask neutrally.'
  : 'Use only these fictional details. Answer relevant questions; do not invent policies, prices, deadlines, outcomes or third-party confirmation.'});
function objective(id,label,criteria,refs,examples) {
  return {id,label,criteria,factIds:refs,accept:examples,reject:[...reject]};
}

// Extend the authored catalog with sixteen distinct situations per direction.
const expansion = require('./conversation-expansion-data.cjs');
const originalStages = {
  transport:['bus-stop-question','bus-delay','bus-ticket','bus-lost-bag'],
  hospitality:['hotel-towels','hotel-luggage','hotel-room-noise','hotel-booking'],
  office:['office-file-access','office-meeting-time','office-handover','team-plan'],
  general:['cafe-order','general-hair-appointment','general-parcel','general-neighbor-noise'],
  construction:['site-instructions','site-materials','site-tool-missing','site-delivery-count'],
  healthcare:['care-water-request','care-visit-time','care-room-air','care-comfort'],
  cleaning:['cleaning-supplies','cleaning-plan','cleaning-occupied-room','cleaning-spill'],
  retail:['shop-find-product','shop-receipt','shop-exchange','shop-price-label'],
  studies:['study-meeting','study-assignment','study-library-book','study-group-roles'],
  family:['family-spare-clothes','kindergarten-plan','family-pickup-delay','family-parent-meeting']
};
const stagesById = Object.fromEntries(Object.values(originalStages).flatMap(ids=>ids.map((id,i)=>[id,i+1])));
for(const [direction,rows] of Object.entries(expansion)) {
  if(rows.length!==16) throw new Error('Expected 16 new situations in '+direction);
  for(const [id,stage,title,brief,report,request,a,b,question,answer] of rows) {
    stagesById[id]=stage;
    const options='În această situație fictivă puteți alege: «'+a+'» sau «'+b+'». O cerere de verificare nu garantează rezultatul; datele nespecificate rămân necunoscute.';
    // Different ambiguity families train reference, time, responsibility and completion.
    const meanings=[
      ['det alternativet','Uttrykket må vise tydelig til enten å '+a+' eller å '+b+'. Presiser hvilket alternativ du mener, uten å endre valget.'],
      ['så snart som mulig','Uttrykket «så snart som mulig» angir ingen bestemt frist. Hvis vi avtaler et tidspunkt, må vi oppgi det uttrykkelig.'],
      ['vi følger opp','Vi må si hvem som gjør hva. Jeg formidler behovet, og du avklarer neste steg med meg.'],
      ['saken er ferdig','Vi har avtalt neste steg, men resultatet er ikke bekreftet.']
    ];
    const [ambiguous,precise]=meanings[stage-1];
    specs.push({path:direction,id,title,roles:brief.split('. ').slice(0,2).join('. ')+'.',
      brief,opening:'Hei! Hva vil du gjerne avklare?',report,request,options,question,answer,
      constraint:'Nora preferă varianta «'+b+'», dar alegerea nu este stabilită. Discută motivul preferinței tale fără să inventezi termene, permisiuni ori rezultate.',
      challenge:'Kan vi heller '+b+'?',
      handoff:'Jeg forklarer behovet mitt, og du avklarer neste steg med meg. Vi følger opp når vi har den nødvendige bekreftelsen.',
      ambiguous,precise});
    comparisons.push('Vi kan '+a+' eller '+b+'. Jeg foreslår det første alternativet fordi det hjelper oss å avklare behovet før vi går videre.');
    responses.push('Jeg forstår at du foretrekker å '+b+'. Jeg foreslår likevel å '+a+' først, så vi kan avklare behovet. Vi kan vurdere det andre alternativet etterpå.');
    clarifications.push('Clarifică detaliul înainte de a confirma planul');
  }
}
if(specs.length!==190 || comparisons.length!==190 || responses.length!==190 || clarifications.length!==190) throw new Error('Expected 190 complete editorial records');

for (const [i,s] of specs.entries()) {
  const original = catalog.scenarios.find(x=>x.path===s.path);
  if(!original) throw new Error('Unknown career path '+s.path);
  const baseObjectives = [
    objective('describe-situation','Explică situația concretă',
      ['Convey the situation with the essential details in this semantic example: '+s.report+' Accept equivalent Norwegian wording and intelligible beginner fragments; never require memorization.'],
      ['situation'],[s.report]),
    objective('request-action','Formulează cererea sau propunerea',
      ['Request or offer the concrete action conveyed by: '+s.request+' A polite equivalent, statement of need or offer is acceptable.'],
      ['situation','available-options'],[s.request]),
    objective('confirm-plan','Confirmă următorul pas convenit',
      ['After an actual partner reply offering or accepting a feasible next step, confirm that step. A short contextual confirmation is enough. A proposal alone or yes before any plan is not an agreement.'],
      ['available-options'],['Ja, da gjør vi det slik. (Only after Nora has offered or accepted a concrete permitted next step.)'])
  ];
  baseObjectives[2].priorPartnerCriteria=[0];
  const base = {
    schemaVersion:1,scenarioId:s.id,roles:{learner:s.roles,partner:'Play only Nora in the role described here: '+s.roles+' Never speak for the learner.'},
    outcome:s.brief,
    facts:[fact('situation',s.brief,'learner'),fact('available-options',s.options)],
    objectives:baseObjectives,allowedResolutions:[s.options,'A feasible equivalent within these facts is acceptable. Agreement is on the next step, not proof that real-world work has already happened.'],
    boundaries:['Fictional Norwegian language roleplay only. Do not ask for real names, child details, passwords or payment information.',
      'Do not give medical, legal, technical safety or operational instructions. Discuss communication and coordination only; refer unspecified procedures to the responsible person.',
      'No new obstacles, hidden goals, invented facts or changing the selected level. Examples are calibration, not transcript evidence.'],
    completion:{success:'All listed objectives need learner evidence. Confirmation requires actual prior partner context.',
      incomplete:'At the turn limit report missing objectives without granting success.',
      successReply:'Takk, da har vi avtalt neste steg.'}
  };
  const pub = {id:s.id,path:s.path,title:s.title,place:places[s.path],role:s.roles,brief:s.brief,opening:s.opening,
    practicePhrases:[s.report,s.request,s.question],goals:baseObjectives.map(o=>o.label),hint:s.request,tile:original.tile,revision:2,variants:{}};
  const levels={};
  for(const level of Object.keys(turns)) {
    const extra=[],facts=[];
    let expectation, brief=s.brief, hint=s.request, challenge=null;
    if(level==='A1') expectation='Explică situația, cere ajutorul potrivit și confirmă următorul pas. Sunt suficiente replici scurte.';
    if(level==='A2') {
      expectation=clarifications[i]+'. Pune o întrebare simplă, apoi confirmă planul.';
      hint=s.question;
      facts.push(fact('clarification-answer',s.answer,'partner'));
      extra.push(objective('clarify-detail',clarifications[i],
        ['Ask or explicitly check the detail conveyed by: '+s.question+' Do not require exact words. A bare yes is not the clarification.'],
        ['available-options','clarification-answer'],[s.question]));
    }
    if(level==='B1') {
      expectation='Compară cele două opțiuni și explică de ce o preferi pe una.';
      brief+=' '+s.options;
      hint='Putem folosi: Vi kan enten … eller … Jeg foreslår … fordi …';
      extra.push(objective('compare-options','Compară opțiunile și justifică alegerea',
        ['Identify both concrete permitted alternatives from available-options.','Choose one and give a relevant reason; a personal preference is allowed, but invented policies are not.'],
        ['available-options'],[comparisons[i]]));
      challenge={prompt:'Hvilke to muligheter har vi, og hvilken foretrekker du?',factIds:['available-options']};
    }
    if(['B2','C1','C2'].includes(level)) {
      brief+=' '+s.options+' '+s.constraint;
      facts.push(fact('level-constraint',s.constraint));
    }
    if(level==='B2') {
      expectation='Răspunde obiecției, explică limita și propune o soluție realistă.';
      hint='Jeg forstår … Samtidig … Derfor foreslår jeg …';
      extra.push(objective('handle-objection','Răspunde obiecției fără promisiuni nefondate',
        ['Acknowledge or address the specific constraint: '+s.constraint,
          'Give a feasible next step and explain why it respects that constraint. The learner may address it proactively, without waiting for the challenge.'],
        ['available-options','level-constraint'],[responses[i]]));
      challenge={prompt:s.challenge,factIds:['available-options','level-constraint']};
    }
    if(level==='C1') {
      expectation='Echilibrează nevoile celor implicați și negociază cine face fiecare pas și când reveniți asupra situației.';
      hint='Jeg kan ta ansvar for … Kan du …? Vi følger opp når …';
      facts.push(fact('handoff-options','A permitted responsibility arrangement, not a completed action: '+s.handoff));
      extra.push(objective('negotiate-responsibilities','Negociază responsabilitățile și urmărirea situației',
        ['Explain a tradeoff or limit grounded in level-constraint.',
          'Propose a concrete responsibility for the learner and for Nora, consistent with available-options. Equivalent feasible allocations are accepted.',
          'State a meaningful sequence, condition or checkpoint for follow-up; do not invent a deadline or claim an unperformed action is complete.'],
        ['available-options','level-constraint','handoff-options'],[responses[i]+' '+s.handoff]));
      challenge={prompt:s.challenge,factIds:['level-constraint','handoff-options']};
    }
    if(level==='C2') {
      expectation='Clarifică formularea ambiguă, reformulează precis și stabilește responsabilitățile pentru următorul pas.';
      brief+=' Verifică sensul expresiei «'+s.ambiguous+'»; nu presupune că un pas planificat este deja îndeplinit.';
      hint='Med «…» mener vi …, ikke … Før vi kan bekrefte …, må …';
      facts.push(fact('meaning-boundary','The phrase «'+s.ambiguous+'» is a hypothetical ambiguity to clarify, not a new event. Correct distinction: '+s.precise));
      facts.push(fact('handoff-options','A feasible future plan, not a completed action: '+s.handoff));
      extra.push(objective('resolve-ambiguity','Clarifică sensul și reformulează precis',
        ['Explicitly distinguish the meanings or states confused by «'+s.ambiguous+'», preserving this meaning: '+s.precise,
          'Offer a clear reformulation suitable for Nora without claiming unsupported completion or certainty. Equivalent wording is accepted.'],
        ['available-options','meaning-boundary'],[s.precise]));
      extra.push(objective('agree-follow-up','Precizează responsabilitățile și condiția de confirmare',
        ['Propose who does the next step and what follows, consistent with the permitted roles and options.',
          'Explain the prerequisite or limit on confirming completion, using meaning-boundary. No additional second confirmation is required beyond confirm-plan.'],
        ['available-options','meaning-boundary','handoff-options'],[s.precise+' '+s.handoff]));
      challenge={prompt:'Hvordan vil du presisere uttrykket «'+s.ambiguous+'» her?',factIds:['meaning-boundary','available-options']};
    }
    if(challenge) challenge.trigger='After the basic situation is established, and only if this communicative task has not already been demonstrated. Introduce at most this one challenge. Ask one question per reply, then clarify rather than add obstacles.';
    const all=[...baseObjectives,...extra];
    levels[level]={language:structuredClone(languageTemplates[level].language),
      interaction:{support:level==='A1'||level==='A2'
        ? 'Ask one concrete question at a time; simplify and offer short scaffolds when requested. Do not introduce advanced constraints. Accept a feasible request, propose its next step and let the learner confirm. For A2, leave space for the learner clarification rather than answering it unprompted.'
        : 'Stay within the single authored challenge. Give brief scaffolds when asked. Accept valid proposals and explicitly offer a next step so confirmation is possible. Do not reveal assessment answers or require exact examples.',
        challenge},facts,extraObjectives:extra};
    pub.variants[level]={label:catalog.levels[level].label,turns:turns[level],expectation,brief,opening:s.opening,hint,
      goals:all.map(o=>o.label),objectiveIds:all.map(o=>o.id)};
  }
  json('backend/scenarios/'+s.id+'.json',base);
  json('backend/scenarios/'+s.id+'.levels.json',levels);
  const existing=catalog.scenarios.findIndex(x=>x.id===s.id);
  if(existing<0) catalog.scenarios.push(pub);
  else catalog.scenarios[existing]=pub;
}

// Keep exactly five authored situations per stage in each direction.
for(const source of catalog.scenarios) {
  source.stage=stagesById[source.id];
  if(!source.stage) throw new Error('Missing authored stage: '+source.id);
  // Existing objective identities and revisions are retained; stage changes coaching only.
}
for(const direction of Object.keys(originalStages)) for(let stage=1;stage<=4;stage++) {
  if(catalog.scenarios.filter(s=>s.path===direction&&s.stage===stage).length!==5) throw new Error('Unbalanced stage: '+direction+'/'+stage);
}
if(catalog.scenarios.length!==200) throw new Error('Expected exactly 200 unique situations');
json(catalogPath,catalog);

const registryPath='backend/scenarioContract.js';
let registry=read(registryPath);
for(const s of specs) {
  const line="  [require('./scenarios/"+s.id+".json'), require('./scenarios/"+s.id+".levels.json')],";
  if(!registry.includes(line)) registry=registry.replace('const contracts = [','const contracts = [\n'+line);
}
write(registryPath,registry);
const illustrationPath='src/modules/exercises/ScenarioIllustration.js';
let illustration=read(illustrationPath);
const atlas={transport:2,hospitality:3,office:4,general:5,construction:6,healthcare:7,cleaning:8,retail:9,studies:10,family:11};
for(const s of specs) {
  const line="  '"+s.id+"': "+atlas[s.path]+",";
  if(!illustration.includes(line)) illustration=illustration.replace('const tiles = {','const tiles = {\n'+line);
}
write(illustrationPath,illustration);
console.log('Catalog: '+catalog.scenarios.length+' scenarios; '+specs.length+' added scenarios with six public/private levels each.');

