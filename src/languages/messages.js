import romanian from './messages/ro.json' with {type: 'json'};
import { getLanguages } from './runtime.js';
export function createTranslator(catalogs, language) {
    return (key, parameters = {})=>{
        const template = catalogs[language]?.[key] ?? catalogs.ro?.[key];
        if (template === undefined) throw new Error(`Unknown UI message: ${key}`);
        return template.replace(/\[\[([a-zA-Z0-9_]+)\]\]/g, (placeholder, name)=>Object.hasOwn(parameters, name) ? String(parameters[name]) : placeholder);
    };
}
const catalogs = {
    ro: romanian
};
const translators = new Map();
export function ui(key, parameters) {
    const language = getLanguages().supportLanguage;
    let translate = translators.get(language);
    if (!translate) {
        translate = createTranslator(catalogs, language);
        translators.set(language, translate);
    }
    return translate(key, parameters);
}
