const tutor = require('./scenarioTutor');
const assessment = require('./scenarioAssessment');

// One quota reservation per learner turn; every provider call contributes usage.
// The total provider deadline remains below the 45-second quota lease.
async function runScenarioTurn({ client, scenario, difficulty, session, message, onUsage = () => {} }) {
  const deadline = Date.now() + 35000;
  async function complete(request) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw Object.assign(new Error('Scenario deadline exceeded'), { status: 504 });
    const completion = await client.chat.completions.create(request, {
      timeout: Math.min(20000, remaining), maxRetries: 0,
    });
    onUsage(completion.usage);
    return assessment.parseCompletion(completion);
  }
  let achieved, feedback, reply;
  if (scenario.definition) {
    const result = await complete(assessment.assessmentRequest(scenario, difficulty, session, message));
    const evaluated = assessment.assess(result, scenario, session, message);
    achieved = evaluated.achieved;
    feedback = evaluated.feedback;
    if (achieved.length === scenario.goals.length) {
      reply = 'Takk, da er planen avtalt. God tur!';
    } else if (session.turn + 1 >= difficulty.turns) {
      reply = 'Takk for samtalen. Vi avslutter øvelsen her.';
    } else {
      reply = assessment.partnerReply(await complete(
        assessment.partnerRequest(scenario, difficulty, session, message, evaluated)));
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
