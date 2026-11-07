// nordlingo-language-context-v1
const {addLanguageInstructions} = require('./languageContext');
const tutor = require('./languageTutors').scenario;
const assessment = require('./scenarioAssessment');

// One quota reservation per learner turn; every provider call contributes usage.
// The total provider deadline remains below the 45-second quota lease.
async function runScenarioTurn({ client, scenario, difficulty, session, message, reference=null, onSentence, signal, onUsage = () => {} }) {
  const deadline = Date.now() + 35000;
  let firstSentence;
  async function complete(request, progressive = false) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw Object.assign(new Error('Scenario deadline exceeded'), { status: 504 });
    if (progressive) {
      const stream = await client.chat.completions.create({...addLanguageInstructions(request), stream:true, stream_options:{include_usage:true}},
        {signal, timeout:Math.min(20000, remaining), maxRetries:0});
      let content = '', finish, refusal;
      for await (const event of stream) {
        if (event.usage) onUsage(event.usage);
        const choice = event.choices[0];
        if (!choice) continue;
        content += choice.delta.content || '';
        refusal ||= choice.delta.refusal;
        finish = choice.finish_reason || finish;
        if (!firstSentence && !refusal) {
          const match = /^\s*\{\s*"lead"\s*:\s*("(?:[^"\\]|\\.)*")/.exec(content);
          if (match) {
            const sentence = JSON.parse(match[1]).trim();
            if(sentence && sentence.length <= 240) { firstSentence=sentence; onSentence(sentence); }
          }
        }
      }
      return assessment.parseCompletion({choices:[{finish_reason:finish,message:{content,refusal}}]});
    }
    const completion = await client.chat.completions.create(addLanguageInstructions(request), {
      timeout: Math.min(20000, remaining), maxRetries: 0,
    });
    onUsage(completion.usage);
    return assessment.parseCompletion(completion);
  }
  let achieved, feedback, reply;
  if (scenario.definition) {
    const combined = process.env.SCENARIO_COMBINED_TURN === 'true';
    const request = combined ? assessment.combinedRequest(scenario, difficulty, session, message, reference)
      : assessment.assessmentRequest(scenario, difficulty, session, message);
    if(combined && onSentence) {
      const schema=request.response_format.json_schema.schema;
      schema.properties={lead:{type:'string',minLength:1,maxLength:240},...schema.properties};
      schema.required.unshift('lead');
      request.messages[0].content += '\nWrite lead FIRST: one short natural Bokmål sentence directly answering the learner in character, using only permitted facts. Do not announce achievement or closure. The reply field is the continuation, usually one short follow-up question. Never repeat the lead. Both together obey the sentence limit.';
    }
    let evaluated;
    for (let attempt=0;attempt<2;attempt++) {
      const result = await complete(request, combined && Boolean(onSentence));
      try {
        evaluated = assessment.assess(result, scenario, session, message);
        if (combined) reply = assessment.partnerReply(result);
        break;
      }
      catch (error) {
        if(attempt===1)throw error;
        // Retry only a rejected assessment, within the same deadline and quota.
        // Never award progress or publish a partner reply from invalid evidence.
        if(firstSentence) request.messages[0].content+='\nThe lead already spoken was '+JSON.stringify(firstSentence)+'. Preserve it and continue from it.';
        request.messages[0].content+='\nThe previous assessment failed validation. Include every objective and criterion in the exact supplied order. Give nonempty feedback. Evidence must quote exact learner transcript substrings with the correct turn IDs; context must quote earlier partner turns. When evidence is absent, mark missing and use empty evidence/context arrays.';
      }
    }
    achieved = evaluated.achieved;
    feedback = evaluated.feedback;
    if (achieved.length === scenario.goals.length) {
      reply = scenario.definition.completion.successReply || 'Takk, da er planen avtalt. God tur!';
    } else if (session.turn + 1 >= difficulty.turns) {
      reply = 'Takk for samtalen. Vi avslutter øvelsen her.';
    } else if (!combined) {
      const request=assessment.partnerRequest(scenario, difficulty, session, message, evaluated);
      if(reference)request.messages.splice(1,0,reference);
      reply = assessment.partnerReply(await complete(request));
    }
  } else {
    // Unmigrated scenarios retain their existing one-call evaluation behavior.
    const result = await complete({
      model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' }, max_tokens: 900,
      messages: [{ role: 'system', content: tutor.prompt(scenario, difficulty) + '\n'
        + JSON.stringify({ remainingLearnerTurns: difficulty.turns - session.turn, completedGoals: session.achieved }) },
      ...session.history, { role: 'user', content: message }],
    });
    achieved = tutor.evaluate(result, session, message, scenario);
    feedback = result.feedback;
    reply = result.reply;
  }
  if(firstSentence) reply = firstSentence + ' ' + reply;
  // Publish a new session only after both assessment and reply have succeeded.
  const next = {
    ...session, achieved, feedback, turn: session.turn + 1,
    done: achieved.length === scenario.goals.length || session.turn + 1 >= difficulty.turns,
    history: [...session.history, { role: 'user', content: message }, { role: 'assistant', content: reply }],
  };
  return { session: next, reply, feedback };
}

function addUsage(total, usage) {
  if (!usage) return total;
  const count = value => Number.isFinite(value) && value > 0 ? Math.trunc(value) : 0;
  return {
    prompt_tokens: (total?.prompt_tokens || 0) + count(usage.prompt_tokens),
    completion_tokens: (total?.completion_tokens || 0) + count(usage.completion_tokens),
    total_tokens: (total?.total_tokens || 0) + count(usage.total_tokens),
    prompt_tokens_details: { cached_tokens: (total?.prompt_tokens_details?.cached_tokens || 0)
      + count(usage.prompt_tokens_details?.cached_tokens) },
  };
}
module.exports = { runScenarioTurn, addUsage };
