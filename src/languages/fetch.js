import {getLanguages} from './runtime.js';
import {pairId} from './config.js';
import {languageHeaders,assertResponseLanguages} from './apiContext.js';

// Capture before authentication/network awaits; reject responses from a course
// the learner left while the request was in flight. No global fetch patch.
export async function languageFetch(input, options={}) {
  const url=typeof input==='string'?input:input.url;
  const pathname=new URL(url,'https://nordlingo.net').pathname;
  if(!/^\/api\/(chat|scenarios|voice|pronunciation|transcription)(\/|$)/.test(pathname))return globalThis.fetch(input,options);
  const languages={...getLanguages()};
  const headers={...(options.headers instanceof Headers?Object.fromEntries(options.headers):options.headers),...languageHeaders(languages)};
  const response=await globalThis.fetch(input,{...options,headers});
  const assertCurrent=()=>{if(pairId(getLanguages())!==pairId(languages))throw new Error('Limba activă s-a schimbat. Începe o conversație nouă.');};
  assertCurrent();
  const json=response.json.bind(response);
  response.json=async()=>{const result=await json();assertCurrent();return response.ok?assertResponseLanguages(result,languages):result;};
  return response;
}
