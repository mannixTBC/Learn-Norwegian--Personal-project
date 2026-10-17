# NordLingo pe Android cu Capacitor

## Cerințe locale

- Node.js 22 sau mai nou
- Android Studio 2025.2.1 sau mai nou
- Android SDK Platform 36 și Android SDK Build-Tools instalate din SDK Manager

Android Studio include JDK-ul necesar. Dacă terminalul nu găsește Java, setează
`JAVA_HOME` către folderul `jbr` din instalarea Android Studio.

## Generează APK-ul de test

1. Instalează dependențele cu `npm install`.
2. Rulează `npm run android:apk`.
3. APK-ul rezultat se găsește în:
   `android/app/build/outputs/apk/debug/app-debug.apk`.

Comanda construiește frontend-ul, îl copiază în proiectul Android și generează
un APK debug. După fiecare modificare web, rulează din nou aceeași comandă.

Pentru dezvoltare în Android Studio:

1. Rulează `npm run android:sync`.
2. Rulează `npm run android:open`.
3. Selectează un emulator sau un telefon conectat și apasă Run.

## Testare în Appetize.io

1. Deschide https://appetize.io/upload.
2. Creează un cont gratuit.
3. Încarcă `app-debug.apk` (nu fișierul `.aab`).
4. Alege un dispozitiv Android și pornește sesiunea.
5. Permite accesul la microfon când Android îl solicită.

Pentru o verificare de bază, testează autentificarea cu e-mail și parolă,
navigarea, o lecție, redarea audio și o înregistrare de pronunție. Conectarea
Google și plățile trebuie verificate separat pe un telefon real înainte de
publicarea în Google Play.

## Configurare

- ID aplicație: `net.nordlingo.app`
- Nume: `NordLingo`
- Conținut web: `dist`
- API implicit: `https://nordlingo.net`

Adresa API poate fi schimbată prin `VITE_API_BASE_URL` înainte de build.
