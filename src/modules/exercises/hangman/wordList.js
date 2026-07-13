const words = [
  ['beklager', 'Cum se traduce „îmi pare rău” în norvegiană?'],
  ['bil', 'Cum se traduce „mașină” în norvegiană?'],
  ['mor', 'Cum se traduce „mamă” în norvegiană?'],
  ['flyplassen', 'Cum se traduce „aeroport” în norvegiană?'],
  ['hus', 'Cum se traduce „casă” în norvegiană?'],
  ['bok', 'Cum se traduce „carte” în norvegiană?'],
  ['sno', 'Cum se traduce „zăpadă” în norvegiană?'],
  ['sol', 'Cum se traduce „soare” în norvegiană?'],
  ['vann', 'Cum se traduce „apă” în norvegiană?'],
  ['mat', 'Cum se traduce „mâncare” în norvegiană?'],
  ['kaffe', 'Cum se traduce „cafea” în norvegiană?'],
  ['takk', 'Cum se traduce „mulțumesc” în norvegiană?'],
  ['venn', 'Cum se traduce „prieten” în norvegiană?'],
  ['arbeid', 'Cum se traduce „muncă” în norvegiană?'],
  ['barn', 'Cum se traduce „copil” în norvegiană?'],
];

function randomList() {
  return words[Math.floor(Math.random() * words.length)];
}

export { randomList };
