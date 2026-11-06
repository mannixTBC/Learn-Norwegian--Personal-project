import { defaultLanguages, resolveLanguages, learningLocale, supportLocale } from './config.js';
let readPreferences = ()=>defaultLanguages;
let lastPreferences = Symbol('unread');
let selection = resolveLanguages(defaultLanguages);
export function installLanguageReader(reader) {
    readPreferences = reader;
    lastPreferences = Symbol('unread');
}
export const getLanguageSelection = ()=>{
    const preferences = readPreferences();
    if (preferences !== lastPreferences) {
        lastPreferences = preferences;
        selection = resolveLanguages(preferences);
    }
    return selection;
};
export const getLanguages = ()=>getLanguageSelection().active;
export const getLearningLocale = ()=>learningLocale(getLanguages().learningLanguage);
export const getSupportLocale = ()=>supportLocale(getLanguages().supportLanguage);
export function courseStorageKey(key, language = getLanguages().learningLanguage) {
    if (/^course:(nb|de|fr|en):/.test(key) || language === 'nb') return key;
    return `course:${language}:${key}`;
}
export function splitCourseStorageKey(key) {
    const match = /^course:(nb|de|fr|en):(.+)$/.exec(key);
    return {
        learningLanguage: match?.[1] || 'nb',
        key: match?.[2] || key
    };
}
