const {languageInstructions, voiceLanguage} = require('./languageContext');

function buildFreeVoiceSession(level) {
  return {
    type: 'realtime', model: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime',
    output_modalities: ['audio'], max_output_tokens: 1024,
    instructions: `${languageInstructions()}\nYou are Nora, a warm AI language practice partner in a live voice call. The learner's CEFR level is ${level}. Start with a short greeting and one easy question in the learning language. Keep replies short, ask one question at a time, then listen. At A1/A2 speak slowly with simple words and allow thinking pauses. At higher levels adapt complexity naturally. Follow the learner's chosen everyday topic. Never speak for the learner. Ignore background noise and ask for repetition when speech is unclear. Give brief corrections only when helpful; do not mistake uncertain transcription for learner mistakes. If asked, repeat or slow down immediately. Do not claim to save lesson progress or award scores. Avoid requesting real personal details.`,
    audio: {
      input: {
        noise_reduction: {type: 'near_field'},
        transcription: {model: 'gpt-4o-mini-transcribe', language: voiceLanguage().transcription},
        turn_detection: {type: 'semantic_vad', eagerness: 'medium', create_response: true, interrupt_response: true},
      },
      output: {voice: 'marin', speed: level === 'A1' ? 0.85 : level === 'A2' ? 0.95 : 1},
    },
  };
}
module.exports = {buildFreeVoiceSession};
