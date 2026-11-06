import catalog from './catalog.json' with {type: 'json'};
export const defaultLanguages = Object.freeze({
    learningLanguage: 'nb',
    supportLanguage: 'ro'
});
export const languageCatalog = catalog;
const own = (object, key)=>typeof key === 'string' && Object.hasOwn(object, key);
export const pairId = (pair)=>`${pair.learningLanguage}:${pair.supportLanguage}`;
export function parseLanguages(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid language pair');
    const pair = value;
    if (!own(catalog.learning, pair.learningLanguage) || !own(catalog.support, pair.supportLanguage)) throw new Error('Invalid language pair');
    return {
        learningLanguage: pair.learningLanguage,
        supportLanguage: pair.supportLanguage
    };
}
export function storedLanguages(value) {
    try {
        return parseLanguages({
            ...defaultLanguages,
            ...value && typeof value === 'object' ? value : {}
        });
    } catch  {
        return {
            ...defaultLanguages
        };
    }
}
export function resolveLanguages(value, released = catalog.releasedPairs) {
    const requested = storedLanguages(value);
    const available = released.includes(pairId(requested));
    return {
        requested,
        active: available ? requested : {
            ...defaultLanguages
        },
        available
    };
}
export const learningLocale = (language)=>catalog.learning[language].locale;
export const supportLocale = (language)=>catalog.support[language].locale;
