import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const android=process.argv[2];
if(!android)throw Error('Pass the read-only Android checkout with its Babel parser.');
const require=createRequire(path.join(path.resolve(android),'package.json'));
const {parse}=require('@babel/parser');
const root=path.resolve(import.meta.dirname,'..'),catalogFile=path.join(root,'src/languages/messages/ro.json');
const messages=JSON.parse(fs.readFileSync(catalogFile,'utf8'));
const byText=new Map(Object.entries(messages).map(([key,text])=>[text,key]));
const keyFor=text=>{let key=byText.get(text);if(!key){key='web_'+crypto.createHash('sha256').update(text).digest('hex').slice(0,16);messages[key]=text;byText.set(text,key);}return key;};
const jsxText=value=>{
 const lines=value.split(/\r\n|\n|\r/);let last=0;
 for(let i=0;i<lines.length;i++)if(/[^ \t]/.test(lines[i]))last=i;
 return lines.map((line,i)=>{let text=line.replace(/\t/g,' ');if(i)text=text.replace(/^ +/,'');if(i!==lines.length-1)text=text.replace(/ +$/,'');return text+(text&&i!==last?' ':'');}).join('');
};
let files=0,replacements=0;
function visit(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
 const file=path.join(directory,entry.name);if(entry.isDirectory()){visit(file);continue;}
 if(!file.endsWith('.js')||file.includes('.test.'))continue;
 const before=fs.readFileSync(file,'utf8');if(!before.includes('React')||before.includes('import {ui}'))continue;
 const ast=parse(before,{sourceType:'module',plugins:['jsx']}),edits=[];
 function walk(node,parent,targetLanguage=false){
  if(!node||typeof node!=='object')return;
  if(node.type==='JSXElement')targetLanguage=targetLanguage||node.openingElement.attributes.some(a=>a.name?.name==='lang'&&a.value?.value==='nb');
  if(!targetLanguage&&node.type==='JSXText'){
   const text=jsxText(node.value);
   if(text.trim()&&/[\p{L}]/u.test(text)){const key=keyFor(text);edits.push({start:node.start,end:node.end,text:`{ui('${key}')}`});return;}
  }
  if(!targetLanguage&&node.type==='StringLiteral'){
   const attribute=parent?.type==='JSXAttribute';
   const visible=attribute&&['aria-label','title','placeholder','alt'].includes(parent.name?.name);
   const forbidden=parent?.type==='ImportDeclaration'||parent?.type==='ExportNamedDeclaration'||(parent?.type==='ObjectProperty'&&parent.key===node&&!parent.computed)||parent?.type==='Directive';
   if(!forbidden&&(visible||(!attribute&&byText.has(node.value)))&&node.value.trim()){
    const key=keyFor(node.value),text=`ui('${key}')`;edits.push({start:node.start,end:node.end,text:attribute?`{${text}}`:text});return;
   }
  }
  for(const [key,value]of Object.entries(node)){if(['loc','comments','tokens','extra'].includes(key))continue;if(Array.isArray(value))value.forEach(n=>walk(n,node,targetLanguage));else if(value&&typeof value==='object')walk(value,node,targetLanguage);}
 }
 walk(ast,null);if(!edits.length)continue;
 let after=before;for(const edit of edits.sort((a,b)=>b.start-a.start))after=after.slice(0,edit.start)+edit.text+after.slice(edit.end);
 let relative=path.relative(path.dirname(file),path.join(root,'src/languages/messages.js')).replaceAll('\\','/');if(!relative.startsWith('.'))relative='./'+relative;
 after=`import {ui} from '${relative}';\n`+after;
 parse(after,{sourceType:'module',plugins:['jsx']});
 fs.writeFileSync(file,after);files++;replacements+=edits.length;
}}
visit(path.join(root,'src/modules'));
fs.writeFileSync(catalogFile,JSON.stringify(messages,null,2)+'\n');
console.log(`Extracted ${replacements} UI occurrences in ${files} files; literal Romanian text is preserved.`);
