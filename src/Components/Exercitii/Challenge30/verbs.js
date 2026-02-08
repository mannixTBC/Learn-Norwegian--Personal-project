// 30 zile × 3 verbe = 90 verbe norvegiene
// Format: { norwegian, romanian }
export const verbsByDay = [
  [{ norwegian: 'å være', romanian: 'a fi' }, { norwegian: 'å ha', romanian: 'a avea' }, { norwegian: 'å gjøre', romanian: 'a face' }],
  [{ norwegian: 'å si', romanian: 'a spune' }, { norwegian: 'å gå', romanian: 'a merge' }, { norwegian: 'å komme', romanian: 'a veni' }],
  [{ norwegian: 'å se', romanian: 'a vedea' }, { norwegian: 'å vite', romanian: 'a ști' }, { norwegian: 'å ville', romanian: 'a vrea' }],
  [{ norwegian: 'å bruke', romanian: 'a folosi' }, { norwegian: 'å finne', romanian: 'a găsi' }, { norwegian: 'å spise', romanian: 'a mânca' }],
  [{ norwegian: 'å drikke', romanian: 'a bea' }, { norwegian: 'å søke', romanian: 'a căuta' }, { norwegian: 'å treffe', romanian: 'a întâlni' }],
  [{ norwegian: 'å leve', romanian: 'a trăi' }, { norwegian: 'å arbeide', romanian: 'a lucra' }, { norwegian: 'å betale', romanian: 'a plăti' }],
  [{ norwegian: 'å lære', romanian: 'a învăța' }, { norwegian: 'å forstå', romanian: 'a înțelege' }, { norwegian: 'å snakke', romanian: 'a vorbi' }],
  [{ norwegian: 'å lese', romanian: 'a citi' }, { norwegian: 'å skrive', romanian: 'a scrie' }, { norwegian: 'å huske', romanian: 'a aminti' }],
  [{ norwegian: 'å vente', romanian: 'a aștepta' }, { norwegian: 'å hjelpe', romanian: 'a ajuta' }, { norwegian: 'å spørre', romanian: 'a întreba' }],
  [{ norwegian: 'å svare', romanian: 'a răspunde' }, { norwegian: 'å åpne', romanian: 'a deschide' }, { norwegian: 'å lukke', romanian: 'a închide' }],
  [{ norwegian: 'å sitte', romanian: 'a sta' }, { norwegian: 'å stå', romanian: 'a sta în picioare' }, { norwegian: 'å ligge', romanian: 'a zăcea' }],
  [{ norwegian: 'å sove', romanian: 'a dormi' }, { norwegian: 'å våke', romanian: 'a fi treaz' }, { norwegian: 'å reise', romanian: 'a călători' }],
  [{ norwegian: 'å flytte', romanian: 'a muta' }, { norwegian: 'å bo', romanian: 'a locui' }, { norwegian: 'å bygge', romanian: 'a construi' }],
  [{ norwegian: 'å kjøpe', romanian: 'a cumpăra' }, { norwegian: 'å selge', romanian: 'a vinde' }, { norwegian: 'å få', romanian: 'a primi' }],
  [{ norwegian: 'å gi', romanian: 'a da' }, { norwegian: 'å ta', romanian: 'a lua' }, { norwegian: 'å sende', romanian: 'a trimite' }],
  [{ norwegian: 'å møte', romanian: 'a întâlni' }, { norwegian: 'å love', romanian: 'a promite' }, { norwegian: 'å tro', romanian: 'a crede' }],
  [{ norwegian: 'å elske', romanian: 'a iubi' }, { norwegian: 'å like', romanian: 'a plăcea' }, { norwegian: 'å hate', romanian: 'a urî' }],
  [{ norwegian: 'å starte', romanian: 'a începe' }, { norwegian: 'å slutte', romanian: 'a termina' }, { norwegian: 'å fortsette', romanian: 'a continua' }],
  [{ norwegian: 'å bestemme', romanian: 'a decide' }, { norwegian: 'å prøve', romanian: 'a încerca' }, { norwegian: 'å lykkes', romanian: 'a reuși' }],
  [{ norwegian: 'å mislykkes', romanian: 'a eșua' }, { norwegian: 'å behøve', romanian: 'a avea nevoie' }, { norwegian: 'å ønske', romanian: 'a dori' }],
  [{ norwegian: 'å forlate', romanian: 'a părăsi' }, { norwegian: 'å følge', romanian: 'a urma' }, { norwegian: 'å kjøre', romanian: 'a conduce' }],
  [{ norwegian: 'å sykle', romanian: 'a merge cu bicicleta' }, { norwegian: 'å svømme', romanian: 'a înota' }, { norwegian: 'å løpe', romanian: 'a alerga' }],
  [{ norwegian: 'å hoppe', romanian: 'a sări' }, { norwegian: 'å falle', romanian: 'a cădea' }, { norwegian: 'å løfte', romanian: 'a ridica' }],
  [{ norwegian: 'å bære', romanian: 'a purta' }, { norwegian: 'å kle', romanian: 'a îmbrăca' }, { norwegian: 'å vaske', romanian: 'a spăla' }],
  [{ norwegian: 'å tørke', romanian: 'a șterge' }, { norwegian: 'å lage', romanian: 'a face' }, { norwegian: 'å røre', romanian: 'a atinge' }],
  [{ norwegian: 'å holde', romanian: 'a ține' }, { norwegian: 'å slippe', romanian: 'a elibera' }, { norwegian: 'å smake', romanian: 'a gusta' }],
  [{ norwegian: 'å kaste', romanian: 'a arunca' }, { norwegian: 'å fange', romanian: 'a prinde' }, { norwegian: 'å skyte', romanian: 'a trage' }],
  [{ norwegian: 'å fly', romanian: 'a zbura' }, { norwegian: 'å lande', romanian: 'a ateriza' }, { norwegian: 'å seile', romanian: 'a naviga' }],
  [{ norwegian: 'å klare', romanian: 'a reuși' }, { norwegian: 'å greie', romanian: 'a descurca' }, { norwegian: 'å lyve', romanian: 'a minți' }],
  [{ norwegian: 'å synes', romanian: 'a părea' }, { norwegian: 'å mene', romanian: 'a considera' }, { norwegian: 'å tenke', romanian: 'a gândi' }],
];

export const getVerbsUpToDay = (day) => {
  const result = [];
  for (let d = 0; d < day && d < verbsByDay.length; d++) {
    result.push(...verbsByDay[d]);
  }
  return result;
};

export const getVerbsForDay = (day) => verbsByDay[day - 1] || [];

/**
 * Pentru exerciții: ziua 1 = 3 verbe; ziua 2+ = 3 verbe din ziua curentă + 3 aleatorii din zilele trecute
 */
export const getVerbsForExercises = (day) => {
  const currentDayVerbs = getVerbsForDay(day);
  if (day <= 1) return currentDayVerbs;

  const previousVerbs = [];
  for (let d = 0; d < day - 1; d++) {
    previousVerbs.push(...verbsByDay[d]);
  }
  if (previousVerbs.length === 0) return currentDayVerbs;

  const shuffled = [...previousVerbs].sort(() => Math.random() - 0.5);
  const randomFromPrevious = shuffled.slice(0, 3);
  return [...currentDayVerbs, ...randomFromPrevious];
};
