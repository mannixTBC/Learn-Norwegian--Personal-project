import { pairId } from '../languages/config';
export function createPackRegistry(packs) {
    const entries = new Map();
    for (const pack of packs){
        if (entries.has(pairId(pack))) throw new Error(`Duplicate content pack: ${pairId(pack)}`);
        entries.set(pairId(pack), pack);
    }
    return {
        get (pair, feature) {
            const pack = entries.get(pairId(pair));
            if (!pack?.features[feature]) throw new Error(`Content unavailable: ${pairId(pair)}/${feature}`);
            return pack.features[feature]();
        },
        has (pair, feature) {
            return !!entries.get(pairId(pair))?.features[feature];
        }
    };
}
