import { getContent } from './activeContent';
export function contentValue(feature, name, array = false) {
    const target = array ? [] : {};
    return new Proxy(target, {
        get: (_, key)=>Reflect.get(getContent(feature)[name], key),
        has: (_, key)=>key in getContent(feature)[name],
        ownKeys: ()=>Reflect.ownKeys(getContent(feature)[name]),
        getOwnPropertyDescriptor: (_, key)=>{
            if (array && key === 'length') return Object.getOwnPropertyDescriptor(target, key);
            const descriptor = Object.getOwnPropertyDescriptor(getContent(feature)[name], key);
            return descriptor ? {
                ...descriptor,
                configurable: true
            } : undefined;
        }
    });
}
