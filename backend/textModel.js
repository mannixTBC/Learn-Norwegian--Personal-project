'use strict';
// Keep speech synthesis and realtime audio models separate from tutor logic.
function textModelSettings(kind = 'chat') {
  const model = process.env[kind === 'feedback' ? 'OPENAI_VOICE_FEEDBACK_MODEL' : 'OPENAI_CHAT_MODEL'] || 'gpt-6-luna';
  return {model, ...(model === 'gpt-6-luna' || model.startsWith('gpt-6-luna-') ? {reasoning_effort:'none'} : {})};
}
module.exports = {textModelSettings};
