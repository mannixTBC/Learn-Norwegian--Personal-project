import { wordDiscoveryCatalog } from './wordDiscoveryCatalog';

// Shared metadata only: original artwork and the discovery game remain untouched.
// Sprites contain 3 columns × 4 rows. Never display an entire sheet as one picture.
export const learningImageCatalog = wordDiscoveryCatalog.map(item => ({
  id: item.id, category: item.category, tags: [item.answer, item.translation],
  description: `${item.translation}: ${item.prompt}`, src: item.image,
  tile: item.tile, columns: 3, rows: 4,
}));
const normalize = text => String(text || '').normalize('NFC').toLocaleLowerCase('nb-NO');
const tokens = text => normalize(text).match(/[\p{L}\p{N}]+/gu) || [];
const byId = new Map(learningImageCatalog.map(image => [image.id, image]));
export const getLearningImage = id => byId.get(id) || null;

// Conservative whole-word matching, never guessed scenes or arbitrary fallbacks.
// Persist the chosen ID on the exercise; explicit null opts out of illustration.
export function selectLearningImageId(answer) {
  const words = new Set(tokens(answer));
  const matches = learningImageCatalog.filter(image => words.has(normalize(image.tags[0])));
  return matches.length === 1 ? matches[0].id : null;
}
