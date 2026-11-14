'use strict';
const catalog = require('./liveLanguageCatalog.json');
function liveLanguageMiddleware(req,res,next) {
  const learningLanguage=req.get('X-NordLingo-Learning-Language') ?? catalog.defaultPair.learningLanguage;
  const supportLanguage=req.get('X-NordLingo-Support-Language') ?? catalog.defaultPair.supportLanguage;
  const version=req.get('X-NordLingo-Language-Version');
  if((version && version!=='1') || !catalog.releasedPairs.includes(`${learningLanguage}:${supportLanguage}`))
    return res.status(400).json({error:'Combinația de limbi nu este validă.',code:'LANGUAGE_INVALID'});
  const course=catalog.courses[learningLanguage];
  const courseId=req.get('X-NordLingo-Course-Id'),courseVersion=req.get('X-NordLingo-Course-Version');
  if((courseId!==undefined || courseVersion!==undefined) && (courseId!==course.courseId || courseVersion!==course.version))
    return res.status(409).json({error:'Versiunea conversației nu corespunde cursului.',code:'SESSION_COURSE_MISMATCH'});
  if(req.method==='POST' && (req.path!=='/session' || req.body?.mode!=='free'))
    return res.status(400).json({error:'Modul conversației live nu este valid.'});
  req.liveLanguages={learningLanguage,supportLanguage};
  res.set('Cache-Control','no-store');res.set('X-NordLingo-Language-Version','1');
  const json=res.json;
  res.json=function(body){return json.call(this,body && !body.error ? {...body,languages:req.liveLanguages,course} : body);};
  next();
}
module.exports={liveLanguageMiddleware};
