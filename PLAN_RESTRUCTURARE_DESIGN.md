# Plan de restructurare a frontend-ului pe principii de design modern

Acest document centralizează analiza vizuală a aplicației „NorvegiaTa" și pașii de implementare recomandați. Este un document de referință — nu modifică codul. Implementarea se face ulterior, pas cu pas, conform ordinii din secțiunea 6.

---

## Notă generală: 5.5 / 10

Aplicația are o viziune de design clară (paletă teal/navy inspirată de fiordurile norvegiene, glass-morphism pe navbar, gradienți, hover-uri cu `translateY`), dar este captivă într-o **migrare incompletă** între vechea paletă roșie (`#ba0c2f`) și noua paletă teal (`--fjord`), fără un design system formalizat.

### Puncte forte
- 8 variabile CSS `--fjord-*` în `:root` — o identitate vizuală coerentă
- `clamp()` pentru font-size hero — best practice modern
- CSS Grid + Flexbox folosite consecvent pe toate paginile
- Umbrele sunt bine controlate (toate pe baza `rgba(20,33,61, x)`)
- ARIA attributes bune pe componente interactive (navbar, tabs, audio, progress)
- Navbar mobil cu backdrop + body scroll lock + Escape key + focus management
- Progressive disclosure pe mobil bine implementat pe toate paginile

### Probleme principale
- ~50 culori hardcodate coexistă cu cele 8 variabile
- 3 palete de accent diferite pe 5 pagini (roșu / teal / verde)
- 25+ font-size fără scară, 7 font-weight, 3 font-family nejustificate
- 3 container widths diferite (1180px / 1160px / 1100px)
- 7+ tipuri de carduri cu stiluri complet diferite
- Pagini funcționale suprasaturate (15-20+ elemente pe LearningHub și Dashboard)
- Lipsă `prefers-reduced-motion` global
- Focus gaps pe elemente interactive cheie
- Contraste sub WCAG AA pe texte gri deschis
- Componente moștenite nefolosite (LessonCard cu Lorem ipsum, ExerciseCards cu Bootstrap)

---

## 1. Faza 1 — Design System & Consistență

### 1.1 Analiza

#### Sistem de culori — migrare incompletă

Există 8 variabile `--fjord-*` definite în `src/App.css`:

| Variabilă | Valoare | Rol |
|-----------|---------|-----|
| `--fjord-deep` | `#14213d` | Navy închis |
| `--fjord` | `#1f6f78` | Teal principal |
| `--fjord-hover` | `#185861` | Teal întunecat |
| `--fjord-mid` | `#3f9299` | Teal mediu |
| `--fjord-soft` | `#e7f2f3` | Teal foarte deschis |
| `--fjord-soft-strong` | `#d1e8ea` | Teal deschis intens |
| `--fjord-light` | `#9ed8dc` | Teal deschis |
| `--fjord-ice` | `#f4f9fa` | Teal gheață |

Aceste 8 variabile sunt folosite ca overrides la sfârșitul fișierelor `LearningHub.css`, `Dashboard.css` și `Navbar.css` — sugerează o migrare în curs de la hardcodat la tokens. `Footer.css` și `Card.css` NU folosesc variabilele.

**~50 culori hardcodate** coexistă cu variabilele:

| Rol | Culori | Locații |
|-----|--------|---------|
| Accent roșu norvegian (initial) | `#ba0c2f`, `#9f0928`, `#9c0927`, `#8b3041` | Navbar login, nav active, butoane hero, lesson numbers, level tabs, calendar today marker |
| Accent roșu suplimentar | `#d7193f`, `#ff4869`, `#ff879e`, `#d33152`, `#c7183b`, `#a70929`, `#d93658`, `#dd4967` | Kickers, progress bars, gradienți, chart bars |
| Navy dark | `#14213d`, `#203d67`, `#315782`, `#233c68`, `#213d66`, `#537ca4` | Hero gradienți, headings, background cards, recommendation icons |
| Teal (hardcoded în afara variabilelor) | `#174e59`, `#318892`, `#248765`, `#58b7bd`, `#58aeb5`, `#62b9be` | Career card gradienți, progress, calendar goal, chart bars, mobile buttons |
| Text secundar (7 nuanțe apropiate) | `#526071`, `#657386`, `#68778a`, `#7c8999`, `#8490a0`, `#7a8797`, `#617083` | Fiecare componentă își definește propria nuanță |
| Text terțiar | `#8994a2`, `#8995a5`, `#8692a1`, `#8a96a5`, `#8a96a4`, `#7e8a99`, `#7c8998` | Labels, meta, legend |
| Borduri (5 variante aproape identice) | `#e4e9f0`, `#dfe6ef`, `#e2e8f0`, `#e8edf3`, `#dfe6ee`, `#e5eaf0` | Borduri card |
| Background card/icon | `#edf3fa`, `#f0f3f7`, `#f1f4f8`, `#f8fafc`, `#fafbfd`, `#edf1f6` | Subtile diferite între componente |
| Verde (semantic) | `#237a50`, `#226149`, `#b8dfd0`, `#e9f7f1` | Completed label, calendar active day |
| Auriu (CTA mobil) | `#ffdd83`, `#f6c453`, `#f0bd3f`, `#ffd066`, `#ffe59d` | Mobile continue buttons |

**Observație critică:** În `LearningHub.css` și `Dashboard.css`, prima jumătate a fișierului definește culori hardcodate cu `#ba0c2f`, iar sfârșitul le suprascrie cu `var(--fjord)` — un artefact clar de migrare.

**3 palete de accent pe 5 pagini diferite:**

| Pagină | Accent |
|--------|--------|
| HomePage, Viața în Norvegia | Roșu `#ba0c2f` |
| Învață, Dashboard | Teal `--fjord` (prin override) |
| Descoperă | Verde `#176b5b` |

**Lipsesc culori semantice** formalizate (success/error/warning). Verdele (`#237a50`) apare doar ca `.completed-label`.

#### Tipografie — fără scară

- **Font-stack principal:** system font (influențat și de Bootstrap importat global)
- **Excepții nejustificate:**
  - `Card.css` declară `'Source Sans 3'` și `'Playfair Display'` — fonturi care NU sunt importate nicaieri
  - `HomePage.css`, `DiscoverCards.css`, `LifeHub.css` folosesc `Georgia, serif`
- **25+ dimensiuni font-size** fără scară: `.54rem`, `.58rem`, `.61rem`, `.62rem`, `.65rem`, `.66rem`, `.68rem`, `.7rem`, `.72rem`, `.75rem`, `.76rem`, `.78rem`, `.82rem`, `.84rem`, `.86rem`, `.9rem`, `.94rem`, `.95rem`, `.98rem`, `1rem`, `1.08rem`, `1.1rem`, `1.12rem`, `1.16rem`, `1.2rem`, `1.25rem`, `1.35rem`, `1.4rem`, `1.62rem`, `1.75rem`, `2rem` + hero `clamp(2.8rem, 7vw, 5.2rem)`
- **7 font-weight:** 400, 600, 700, 750, 800, 850, 900, 950
- **17 valori line-height** diferite (de la `1.0` la `1.65`)
- **Fără design tokens** pentru nimic din tipografie

#### Spațiere & Layout

- **3 container widths diferite:**
  - `min(1180px, 100%)` — Navbar, HomePage, LearningHub
  - `min(1160px, calc(100% - 40px))` — Dashboard (cu 20px mai îngust)
  - `max-width: 1100px` — Footer (cu 80px mai îngust)
- **Spacing-uri** aproape multiplu de 4px, dar cu excepții frecvente (5, 7, 9, 13, 22px)
- **~20 border-radius** diferite (de la 2px la 25px) fără scară

#### Carduri — 7+ tipuri distincte

| # | Componentă | Clasă | Radius | Shadow | Accent |
|---|------------|-------|--------|--------|--------|
| 1 | Landing card (Home) | `.landing-card` | 16px | da | `#ba0c2f` roșu |
| 2 | Continue card (Learn) | `.continue-card` | 17px | da | teal |
| 3 | Career track card | `.career-track-card` | 17px | da gradienți | teal |
| 4 | Course block (Learn) | `.course-block` | 20px | nu (doar border) | teal |
| 5 | Practice tool (Learn) | `.practice-tool` | 16px | da | teal |
| 6 | Dashboard task card | `.today-task` | 17px | da | teal/galben |
| 7 | Common Card | `.card-edu` | 16px | da | **`#0d6efd` Bootstrap blue!** |
| 8 | Dashboard recommendation | `article` | 15px | nu inițial | teal |
| 9 | Dashboard level card | `article` | 14px | nu | teal |

`Card.css` este complet desincronizat — folosește albastrul default Bootstrap, `Source Sans 3` și `Playfair Display`.

#### Componente moștenite nefolosite

| Fișier | Problemă |
|--------|----------|
| `src/modules/lessons/ui/LessonCard.jsx` | **Lorem ipsum hardcodat** (linia 14), clase Bootstrap (`card-body`, `text-dark`, `card-img-top`) |
| `src/modules/lessons/ui/LessonCard.css` | `body{background: radial-gradient(...)}`, `.text-center{margin-left: 3rem}` |
| `src/modules/lessons/ui/LessonCards.jsx` | Importă `LessonCard` — atât |
| `src/modules/exercises/ExerciseCards.js` | Class Component cu Bootstrap (`container-fluid`, `col-md-3`), importă `Card` din `common/Card` |

Aceste 4 fișiere **nu sunt importate de nicio altă componentă** (verificat cu `grep -rn`). Lanțul de dependențe:

```
ExerciseCards.js → Card.jsx/Card.css        [ambele capete orphan]
LessonCards.jsx → LessonCard.jsx → LessonCard.css  [toate 3 orphan]
```

Niciuna din rutele din `routeConfig.js` nu le folosește.

### 1.2 Plan de implementare — Faza 1

#### Pasul 1.1 — Extindem tokenii CSS în `src/App.css`

Adăugăm la `:root` (după variabilele `--fjord-*` existente):

```css
/* Culori semantice */
--color-accent: var(--fjord);
--color-accent-hover: var(--fjord-hover);
--color-success: #226149;
--color-success-bg: #e9f7f1;
--color-warning: #b26a2f;
--color-warning-bg: #fef3e2;
--color-error: #ba0c2f;
--color-error-bg: #fff0f2;

/* Text */
--color-text-primary: #14213d;
--color-text-secondary: #526071;
--color-text-tertiary: #5e6d7e; /* contrast ~5.3:1 pe alb — peste WCAG AA */

/* Surface & borduri */
--color-surface: #ffffff;
--color-surface-muted: #f8fafc;
--color-border: #e2e8f0;

/* Scară tipografică */
--font-size-xs: 0.72rem;
--font-size-sm: 0.84rem;
--font-size-base: 1rem;
--font-size-lg: 1.16rem;
--font-size-xl: 1.4rem;
--font-size-2xl: 1.75rem;
--font-size-3xl: clamp(2rem, 5vw, 3.5rem);

/* Greutăți font (4 niveluri în loc de 7) */
--font-weight-normal: 400;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;

/* Scară spațiere (multiplu de 4px) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;

/* Radii */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 50%;

/* Umbre */
--shadow-sm: 0 4px 12px rgba(20, 33, 61, 0.05);
--shadow-md: 0 8px 24px rgba(20, 33, 61, 0.07);
--shadow-lg: 0 14px 32px rgba(20, 33, 61, 0.10);

/* Container */
--container-max: 1180px;

/* Motion */
--duration-fast: 0.16s;
--duration-normal: 0.18s;
--duration-slow: 0.25s;
--ease: ease;
```

#### Pasul 1.2 — Unificăm container widths

| Fișier | Din | În |
|--------|-----|-----|
| `Dashboard.css:1` | `width: min(1160px, calc(100% - 40px))` | `width: min(var(--container-max), calc(100% - var(--space-6)))` |
| `Footer.css` | `max-width: 1100px` | `max-width: var(--container-max)` |

#### Pasul 1.3 — Ștergem componentele moștenite nefolosite

Ștergem:
- `src/modules/lessons/ui/LessonCard.jsx`
- `src/modules/lessons/ui/LessonCard.css`
- `src/modules/lessons/ui/LessonCards.jsx`
- `src/modules/exercises/ExerciseCards.js`

Verificat: niciunul nu este importat în `routeConfig.js` sau în alte componente.

#### Pasul 1.4 — Aliniem `Card.css` la tokenii fjord

În `src/modules/common/Card.css`:
- `#0d6efd` (Bootstrap blue) → `var(--color-accent)`
- `font-family: 'Source Sans 3'` → eliminat (folosește font-stack sistem)
- `font-family: 'Playfair Display'` → eliminat
- `box-shadow: 0 4px 16px rgba(0,0,0,0.06)` → `var(--shadow-sm)`
- `border: 1px solid #e9ecef` → `border: 1px solid var(--color-border)`

Componenta `Card.jsx` rămâne intactă.

---

## 2. Faza 2 — Ierarhie vizuală & Layout

### 2.1 Analiza

#### HomePage — ✅ Bună

- Hero cu 2 CTA-uri (primary + secondary ghost), pe mobil secondary dispare (`display: none`)
- 3 carduri egale de navigare — corect
- Un singur obiectiv clar
- Sub hero: `landing__cards` cu grid 3 coloane

#### LearningHub — ❌ Suprasaturată

15-20+ elemente vizibile deasupra fold-ului pe desktop:

1. Hero (kicker + titlu + progress bar)
2. Career track card (gradient teal complet)
3. Continue card
4. Section heading „Niveluri de învățare"
5. 4 level tabs
6. Course block header (stats)
7. 8-10 lecții în listă
8. Final test card
9. 3 instrumente (recapitulare, pronunție, verbe)
10. 3 exerciții practice (chestionar, drag, hangman)

Career-track-card și continue-card sunt **2 elemente „calde"** înainte de acțiunea principală. Pe mobil, order-ul este corect (hero → continue → career), dar pe desktop nu există progressive disclosure.

Link-ul „Deschide →" din `LearningHub.js:99` este text (`<Link className="lesson-action">`), nu buton — task #3 din TASKURI neimplementat.

#### Dashboard — ❌ Suprasaturată

17-20+ elemente:

1. Hero (salut + ring obiectiv zilnic 126px)
2. Career track card
3. 3 today-tasks (lecție, recapitulare, pronunție)
4. 4 stats
5. Chart săptămânal
6. Calendar (28 zile)
7. 5 recomandări
8. Progres pe niveluri

Secțiunea „Recomandări pentru tine" (`Dashboard.js:108-121, 202-205`) duplică informația din today-tasks — task #5 din TASKURI neimplementat.

Pe mobil: today-tasks întreg dispare (`display: none`), calendarul dispare, recomandările arată doar 2.

#### DiscoverCards — ⚠️ Hero prea mare

- `min-height: 590px` cu un singur ghost button transparent
- Prea mult scroll înainte de prima acțiune utilă (experience-grid)
- CTA final (jos) e solid roșu — ar trebui invers (hero solid, final ghost)

#### NorwayLifeHub — ⚠️ 1 coloană pe desktop

- Articolele sunt pe 1 coloană (listă verticală)
- Task-ul cere 2 coloane pe desktop
- Progressive disclosure pe mobil este bine implementat (limitează la 5 articole)

### 2.2 Plan de implementare — Faza 2

#### Pasul 2.1 — LearningHub: un singur obiectiv principal

**Obiectiv:** Utilizatorul vede imediat ce are de făcut. Restul e accesibil secundar.

Modificări în `LearningHub.js`:

1. **Hero compact** — reducem padding (`48px → 32px` în CSS)
2. **Continue-card îmbogățit** devine cardul principal:
   - Numărul lecției, titlul, descrierea (existent)
   - Adăugăm linia: `Cu situații practice din {careerPath.shortTitle}` (varianta recomandată din TASKURI.md)
   - Adăugăm mini progress bar în card
   - CTA adaptat stării: `Începe lecția` / `Continuă lecția` / `Recapitulează`
3. **Eliminăm `career-track-card` pe desktop** — informația se integrează în continue-card. Pe mobil (≤540px) o păstrăm ca rând sub continue-card. Link-ul „Schimbă direcția" se mută în continue-card.
4. **Lista de lecții devine colapsabilă** cu buton discret „Vezi programa completă (N lecții)" — course block-ul se deschide/închide la click (progressive disclosure pe desktop)
5. **Instrumente + Practică** grupate într-un accordion: „Instrumente suplimentare (6)" care se deschide la click
6. **Înlocuim link-ul „Deschide →"** cu buton `<Link className="learn-button">` cu text adaptat stării lecției (implementăm task #3 din TASKURI.md)

Modificări în `LearningHub.css`:

- Hero: `padding: 48px → 32px`
- Continue-card: lărgim, integrăm informația de career path, CTA ca buton styled
- Course block: adăugăm stare colapsată (`max-height: 0; overflow: hidden`) + tranziție
- Instrumente/Practică: wrapping într-un container cu toggle

**Rezultat vizibil pe desktop:** Hero compact → Continue-card (cu direcție + progres + CTA adaptat) → [Vezi programa ▾] → [Instrumente ▾]

**Impact asupra funcționalității:** Zero. Toate lecțiile și instrumentele rămân accesibile. Doar expunerea se schimbă.

#### Pasul 2.2 — Dashboard: reducem densitatea

Modificări în `Dashboard.js`:

1. **Eliminăm secțiunea „Recomandări pentru tine"** (liniile 108-121, 202-205):
   - Informația e parțial duplicată în today-tasks (lecție, recapitulare, pronunție)
   - Link-urile rămân accesibile: lecția în today-task, pronunția în today-task, verbele și recapitularea în LearningHub, testul final la finalul listei de lecții
   - Singura pierdere: expunerea contextuală ca recomandări pe Dashboard
2. **Unificăm Chart + Calendar** într-un singur panou: calendarul devine sub-component sub chart

Modificări în `Dashboard.css`:
- Eliminăm `.dashboard-recommendations` (grid, heading, carduri)
- Combinăm `dashboard-calendar` cu `dashboard-week` într-un layout mai compact

**Rezultat vizibil pe desktop:** Hero → Today (3 task-uri) → Stats → Chart+Calendar → Niveluri

**Impact asupra funcționalitatei:** Vezi secțiunea 4 — tabel detaliat.

#### Pasul 2.3 — DiscoverCards: reducem hero-ul

Modificări în `DiscoverCards.css`:
- `min-height: 590px → 360px`
- Schimbăm ghost CTA cu buton solid teal: „Explorează Norvegia →"
- CTA final de jos devine secondary (ghost sau border-only)

**Impact:** Zero. Doar cosmetic.

#### Pasul 2.4 — NorwayLifeHub: 2 coloane pe desktop

Modificări în `NorwayLifeHub.js` sau în fișierul CSS asociat (`.article-list` sau `.library-articles`):
- Pe `@media (min-width: 768px)`: `grid-template-columns: repeat(2, 1fr); gap: 16px`
- Păstrăm 1 coloană pe mobil

**Impact:** Zero. Doar layout grid.

---

## 3. Faza 3 — Accesibilitate WCAG

### 3.1 Analiza

#### `prefers-reduced-motion` — absent complet

Niciun fișier CSS analizat nu conține `@media (prefers-reduced-motion: reduce)`.

**Animații care rulează necondiționat:**
- `@keyframes navbar-backdrop-in` (`Navbar.css`)
- `@keyframes navbar-dropdown-in` (`Navbar.css`)
- `@keyframes dialogue-audio-pulse` (`LessonProgram.css`)
- `@keyframes mobile-expression-in` (`LessonProgram.css`)
- Multiple `transition` pe hover/click (`.18s ease` dominant) pe toate paginile

#### `:focus-visible` — gaps semnificative

| Fișier CSS | Are `:focus-visible`? | Lipsesc |
|------------|----------------------|---------|
| `Navbar.css` | da (4 reguli) | `.nav-link` — **fără focus** (invizibil la tastatură) |
| `LessonProgram.css` | da (3 reguli) | `.choice-list button`, `.word-bank button`, `.sentence-builder button`, `.check-button` |
| `CareerOnboarding.css` | da (1 regulă) | — |
| `SupabaseAuth.css` | da (parțial) | `.auth-submit`, `.auth-tabs button`, `.auth-password button`, `.auth-forgot` |
| `AuthPage.css` | nu (doar `:focus`) | Toate input-urile folosesc `:focus` în loc de `:focus-visible` |
| `LearningHub.css` | nu (0 reguli) | `.lesson-action`, `.level-tab`, `.learn-button`, `.review-tool-link`, `.practice-tool`, `.final-test-card a` |
| `Dashboard.css` | da (bun) | — |

#### Contraste sub WCAG AA (4.5:1)

| Element | Culoare text | Raport estimat | Fișier |
|---------|-------------|----------------|--------|
| `.navbar__user small` | `#8994a2` pe alb | ~3.3:1 | `Navbar.css:60` |
| `.lesson-stepper small`, `button` | `#8a96a5` pe alb | ~3.2:1 | `LessonProgram.css` |
| `.career-path-card__copy small` | `#6e7c8f` pe alb | ~4.5:1 (la limită) | `CareerOnboarding.css` |
| `.vocabulary-card__example > span` | `#8995a3` pe alb | ~3.3:1 | `LessonProgram.css` |
| `.dashboard-stats p` | `#8a96a5` pe alb | ~3.2:1 | `Dashboard.css` |
| `.today-task__top > small` | `#8995a5` pe alb | ~3.2:1 | `Dashboard.css` |

#### Touch targets sub 44px (WCAG)

| Element | Înălțime curentă | Fișier |
|---------|------------------|--------|
| `.dialogue-line-audio-button` | **30px** | `LessonProgram.css:16` |
| `.compact-slow-audio-button` | 40px | `LessonProgram.css:127` |
| `.auth-tabs button` (mobil) | 42px | `SupabaseAuth.css:138` |

#### `prefers-color-scheme` (dark mode) — absent

Aplicația are doar un singur theme (light). Implementarea dark mode este **opțională** și nu face parte din planul de bază.

#### Bune practici existente (de păstrat)

- `aria-label`, `aria-expanded`, `aria-controls`, `aria-live`, `role="tablist"/"tab"/"alert"/"status"`
- `lang="no"` pe texte norvegiene, `lang="ro"` pe traduceri
- `autoComplete` corect pe form-uri (`name`, `email`, `current-password`, `new-password`)
- Escape key + body scroll lock pe meniu mobil
- Touch targets ≥ 42-48px pe majoritatea butoanelor mobile
- `:focus-visible` bun pe Navbar, LessonProgram (parțial), Dashboard

### 3.2 Plan de implementare — Faza 3

#### Pasul 3.1 — `prefers-reduced-motion` global în `src/App.css`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Această regulă globală acoperă toate cele 4 `@keyframes` și toate tranzițiile `.18s/.2s` din aplicație.

#### Pasul 3.2 — `:focus-visible` pe elementele lipsă

Adăugăm reguli de focus în fiecare CSS afectat. Stil comun pentru toate:

```css
outline: 3px solid var(--fjord-light);
outline-offset: 2px;
```

Fișiere și selectori:

| Fișier | Selectori de adăugat |
|--------|---------------------|
| `Navbar.css` | `.nav-link:focus-visible` |
| `LearningHub.css` | `.lesson-action:focus-visible`, `.level-tab:focus-visible`, `.learn-button:focus-visible`, `.review-tool-link:focus-visible`, `.practice-tool:focus-visible`, `.final-test-card a:focus-visible` |
| `LessonProgram.css` | `.choice-list button:focus-visible`, `.word-bank button:focus-visible`, `.sentence-builder button:focus-visible`, `.check-button:focus-visible` |
| `AuthPage.css` | Înlocuim `input:focus` cu `input:focus-visible` pe toate input-urile |
| `SupabaseAuth.css` | `.auth-submit:focus-visible`, `.auth-tabs button:focus-visible`, `.auth-password button:focus-visible`, `.auth-forgot:focus-visible` |

#### Pasul 3.3 — Corectăm contrastele sub 4.5:1

Înlocuim toate instanțele culorilor gri deschis sub WCAG AA:

| Din | În | Contrast nou |
|-----|-----|--------------|
| `#8994a2` | `#5e6d7e` | ~5.3:1 pe alb |
| `#8a96a5` | `#5e6d7e` | ~5.3:1 pe alb |
| `#8995a3` | `#5e6d7e` | ~5.3:1 pe alb |
| `#8490a0` | `#5e6d7e` | ~5.3:1 pe alb |
| `#7a8797` | `#5e6d7e` | ~5.3:1 pe alb |

Fișiere afectate: `Navbar.css`, `LessonProgram.css`, `Dashboard.css`, `CareerOnboarding.css`.

Ulterior, acestea se vor înlocui cu `var(--color-text-tertiary)` odată cu Faza 1.

#### Pasul 3.4 — Touch targets

| Fișier | Selector | Din | În |
|--------|----------|-----|-----|
| `LessonProgram.css` | `.dialogue-line-audio-button` | `height: 30px` | `min-height: 44px` |
| `LessonProgram.css` | `.compact-slow-audio-button` | `width/height: 40px` | `width/height: 44px` |

---

## 4. Impact asupra funcționalității

### LearningHub — doar vizual, fără pierderi

| Schimbare | Funcționalitate afectată? |
|-----------|---------------------------|
| Career-track-card ascuns pe desktop | **Nu.** Direcția rămâne vizibilă pe Dashboard și se integrează în continue-card. Link-ul „Schimbă direcția" se mută în continue-card. Pe mobil rămâne vizibil. |
| Lista de lecții devine colapsabilă | **Nu.** Toate lecțiile rămân accesibile la click pe „Vezi programa". Doar nu mai sunt toate desfăcute din start. |
| Instrumente + Practică grupate într-un accordion | **Nu.** Chestionar, drag-and-drop, hangman, pronunție, verbe, recapitulare — toate rămân accesibile. Doar sunt grupate sub un singur buton. |
| „Deschide →" devine buton cu text adaptat | **Nu.** Link-ul duce la aceeași rută `/curs/:level/:lessonId`. Doar textul și stilul se schimbă. |
| Hero compact (padding redus) | **Nu.** Doar cosmetic. |

### Dashboard — o singură secțiune eliminată

| Schimbare | Funcționalitate afectată? |
|-----------|---------------------------|
| Eliminăm „Recomandări pentru tine" | **Parțial da.** Cele 5 recomandări (scenariu career, recapitulare, pronunție, test final, verbe) dispar ca secțiune vizibilă. Dar **toate link-urile lor rămân accesibile** — lecția și pronunția în today-tasks, verbele și recapitularea în LearningHub, testul final la finalul listei de lecții. Singura pierdere este expunerea contextuală ca recomandări pe Dashboard. |
| Calendar mutat sub chart | **Nu.** Ambele sunt încă vizibile, doar într-un layout mai compact. |

### Restul modificărilor (Faza 1 + Faza 3)

**Zero funcționalitate afectată.** Totul e CSS și tokeni vizuali: culori, spațiere, focus outlines, reduced-motion, contraste, touch targets.

### Decizii de produs necesare

Pentru secțiunea „Recomandări pentru tine" de pe Dashboard, există 3 variante:

- **Varianta A (recomandată):** Eliminăm secțiunea complet. Dashboard-ul devine mai curat. Link-urile există în alte pagini.
- **Varianta B:** Păstrăm secțiunea dar o facem colapsabilă („Vezi recomandări ▾") — zero informație pierdută.
- **Varianta C:** Nu eliminăm nimic din Dashboard. Facem doar simplificările din LearningHub și restul fazelor.

---

## 5. Fișiere de șters

Aceste 4 fișiere **nu sunt importate de nicio componentă** din aplicație (verificat cu `grep -rn` în `src/`):

| Fișier | Motiv ștergere |
|--------|----------------|
| `src/modules/lessons/ui/LessonCard.jsx` | Lorem ipsum hardcodat, clase Bootstrap, neimportat |
| `src/modules/lessons/ui/LessonCard.css` | Folosit doar de `LessonCard.jsx` — orphan |
| `src/modules/lessons/ui/LessonCards.jsx` | Importă `LessonCard` — neimportată de nimeni |
| `src/modules/exercises/ExerciseCards.js` | Class Component cu Bootstrap, neimportat. Exercițiile sunt acum în `LearningHub.js` |

**Lanțuri de dependențe verificate:**

```
ExerciseCards.js → Card.jsx / Card.css            [ambele capete orphan]
LessonCards.jsx → LessonCard.jsx → LessonCard.css  [toate 3 orphan]
```

Niciuna din rutele din `routeConfig.js` nu folosește aceste componente. Rutele existente trimit direct către componente diferite (`QuizPractice`, `OrderPractice`, `WordPractice`, `Pronunciation`, `Challenge30`).

---

## 6. Ordinea recomandată de implementare

| Ordine | Pas | Fișiere | Motiv |
|--------|-----|---------|-------|
| 1 | `prefers-reduced-motion` global | `App.css` | 1 regulă, impact imediat, zero risc |
| 2 | Ștergem componentele moștenite | 4 fișiere șterse | Curățenie, reduce confuzia, zero risc |
| 3 | Tokenii CSS | `App.css` | Baza pentru tot ce urmează |
| 4 | Unificăm container widths | `Dashboard.css`, `Footer.css` | 2 înlocuiri, consecvență imediată |
| 5 | Corectăm contrastele | `Navbar.css`, `LessonProgram.css`, `Dashboard.css`, `CareerOnboarding.css` | Înlocuiri de culori, independente de layout |
| 6 | `:focus-visible` pe elementele lipsă | `Navbar.css`, `LearningHub.css`, `LessonProgram.css`, `AuthPage.css`, `SupabaseAuth.css` | Adăugări CSS, independente de layout |
| 7 | Touch targets | `LessonProgram.css` | 2 valori CSS |
| 8 | LearningHub simplificare | `LearningHub.js`, `LearningHub.css` | Schimbarea cea mai vizibilă — necesită testare |
| 9 | Dashboard reducere | `Dashboard.js`, `Dashboard.css` | Eliminăm recomandări, combinăm calendar |
| 10 | DiscoverCards hero | `DiscoverCards.css` | Reducem 590px → 360px |
| 11 | NorwayLifeHub 2 coloane | `NorwayLifeHub.js` sau CSS | Grid simplu |
| 12 | `Card.css` la tokeni | `Card.css` | Ulterior, după ce tokenii sunt stabili |

---

## 7. Sumar fișiere modificate și șterse

### Fișiere modificate (~14)

| Fișier | Faza | Modificări |
|--------|------|------------|
| `src/App.css` | 1 + 3 | Tokeni CSS + `prefers-reduced-motion` |
| `src/modules/common/Card.css` | 1 | Tokeni fjord, eliminăm Bootstrap blue și fonturi custom |
| `src/modules/dashboard/Dashboard.css` | 1 + 2 + 3 | Container width, eliminăm recomandări, tokeni, contraste |
| `src/modules/dashboard/Dashboard.js` | 2 | Eliminăm secțiunea recomandări |
| `src/modules/layout/Footer/Footer.css` | 1 | Container `var(--container-max)` |
| `src/modules/layout/Navbar/Navbar.css` | 3 | Focus pe `.nav-link`, tokeni text-tertiary |
| `src/modules/lessons/LearningHub.js` | 2 | Continue-card îmbogățit, programa colapsabilă, buton stadiu lecție |
| `src/modules/lessons/LearningHub.css` | 2 + 3 | Simplificare layout, tokeni, focus-visible |
| `src/modules/lessons/norwegian-program/LessonProgram.css` | 3 | Focus-visible, touch targets, contraste |
| `src/modules/auth/AuthPage.css` | 3 | Focus-visible pe inputs |
| `src/modules/auth/SupabaseAuth.css` | 3 | Focus-visible pe butoane |
| `src/modules/discover/DiscoverCards.css` | 2 | Reducem hero, CTA solid |
| `src/modules/discover/NorwayLifeHub.js` sau `LifeHub.css` | 2 | 2 coloane pe desktop |
| `src/modules/onboarding/CareerOnboarding.css` | 3 | Contraste |

### Fișiere șterse (4)

- `src/modules/lessons/ui/LessonCard.jsx`
- `src/modules/lessons/ui/LessonCard.css`
- `src/modules/lessons/ui/LessonCards.jsx`
- `src/modules/exercises/ExerciseCards.js`

---

## 8. Scor pe principii de design modern (înainte / țintă)

| Principiu | Scor curent | Scor țintă | Observație |
|-----------|-------------|------------|------------|
| Design tokens / System | 2/10 | 8/10 | Tokeni compleți în loc de 8 variabile |
| Consistență vizuală | 4/10 | 8/10 | 1 paletă de accent, 3 tipuri de carduri |
| Ierarhie vizuală | 5/10 | 8/10 | Un singur obiectiv principal pe pagină |
| Tipografie | 3/10 | 8/10 | Scară de 7 niveluri în loc de 25+ |
| Spațiere | 6/10 | 9/10 | Scară de 10 niveluri, container unificat |
| Responsive | 7/10 | 9/10 | Breakpoints consistente |
| Accesibilitate (WCAG) | 4/10 | 9/10 | Reduced-motion, focus complet, contraste AA |
| Motion & Feedback | 7/10 | 8/10 | Păstrăm timing-ul consecvent |
| Progressive Disclosure | 6/10 | 9/10 | Pe desktop și mobil |
| Paletă & Identitate | 6/10 | 9/10 | Migrare finalizată |
