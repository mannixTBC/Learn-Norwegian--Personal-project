// Cuvinte norvegiene cu categoria lor (animal sau culoare)
const words = [
  { id: 'w1', text: 'bever', category: 'animal' },
  { id: 'w2', text: 'kalv', category: 'animal' },
  { id: 'w3', text: 'svart', category: 'color' },
  { id: 'w4', text: 'gul', category: 'color' },
];

// Coloane: words = de unde tragem, animals = unde punem animalele, colors = unde punem culorile
const initialData = {
  words: words.map(w => w.id),
  categories: {
    animals: { id: 'animals', title: 'Animale', wordIds: [], correctCategory: 'animal' },
    colors: { id: 'colors', title: 'Culori', wordIds: [], correctCategory: 'color' },
  },
  categoryOrder: ['animals', 'colors'],
  wordMap: Object.fromEntries(words.map(w => [w.id, w])),
};

export default initialData;
