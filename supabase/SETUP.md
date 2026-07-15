# Configurare Supabase pentru NorvegiaTa

1. Creează un proiect în Supabase.
2. Deschide `SQL Editor`, copiază conținutul din `schema.sql` și rulează-l o singură dată.
3. În `Authentication > Providers`, păstrează activ `Email`.
4. Activează `Anonymous Sign-Ins` pentru butonul „Continuă ca vizitator”.
5. Opțional, activează Google și completează datele OAuth cerute de Supabase.
6. În `Authentication > URL Configuration`, adaugă:
   - `http://127.0.0.1:4173/**`
   - `http://localhost:4173/**`
   - adresa publică Netlify, când facem deploy-ul major.
7. Copiază din `Project Settings > API` URL-ul proiectului și cheia publică/publishable în `.env`:

```text
VITE_SUPABASE_URL=https://proiectul-tau.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=cheia_publica
```

Nu introduce cheia `service_role` în `.env`-ul frontend și nu folosi prefixul `VITE_` pentru secrete. Variabilele `VITE_` sunt publice în browser.
