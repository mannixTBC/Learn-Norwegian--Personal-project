import { defaultLanguages, pairId, parseLanguages } from './config.js';
import {bundledCourses, courseHeaders} from '../data/courseIdentity.js';
export function languageHeaders(languages) {
    const pair = parseLanguages(languages);
    return {
        ...(bundledCourses.some(course => course.learningLanguage === pair.learningLanguage) ? courseHeaders(pair.learningLanguage) : {}),
        'X-NordLingo-Language-Version': '1',
        'X-NordLingo-Learning-Language': pair.learningLanguage,
        'X-NordLingo-Support-Language': pair.supportLanguage
    };
}
export function conversationKey(key, languages) {
    return pairId(languages) === pairId(defaultLanguages) ? key : `${key}:languages:${pairId(languages)}`;
}
export function assertResponseLanguages(result, expected) {
    if (result?.languages) {
        if (pairId(parseLanguages(result.languages)) !== pairId(expected)) throw new Error('Limba conversației nu corespunde cursului. Începe o conversație nouă.');
    } else if (pairId(expected) !== pairId(defaultLanguages)) {
        throw new Error('Serverul nu este încă pregătit pentru această combinație de limbi.');
    }
    return result;
}
