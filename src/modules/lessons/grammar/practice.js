// Adapted from NordLingo Android; content is independent of the renderer.
function shuffle(values, random) {
    const result = [
        ...values
    ];
    for(let index = result.length - 1; index > 0; index -= 1){
        const other = Math.floor(random() * (index + 1));
        [result[index], result[other]] = [
            result[other],
            result[index]
        ];
    }
    return result;
}
export function makeGrammarSession(chapter, id, random = Math.random) {
    return {
        id,
        questions: shuffle(chapter.questions, random).slice(0, 5).map((question)=>({
                ...question,
                options: shuffle(question.options, random)
            })),
        index: 0,
        choice: null,
        answers: [],
        phase: 'question'
    };
}
export function grammarSessionReducer(session, action) {
    if (session.phase === 'complete') return session;
    const question = session.questions[session.index];
    if (action.type === 'answer') {
        if (session.choice !== null || !question.options.includes(action.answer)) return session;
        return {
            ...session,
            choice: action.answer
        };
    }
    if (session.choice === null) return session;
    const answers = [
        ...session.answers,
        {
            questionId: question.id,
            answer: session.choice,
            correct: session.choice === question.answer
        }
    ];
    if (answers.length === session.questions.length) return {
        ...session,
        answers,
        phase: 'complete'
    };
    return {
        ...session,
        answers,
        index: session.index + 1,
        choice: null
    };
}
export function grammarResult(session) {
    const correct = session.answers.filter((answer)=>answer.correct).length;
    return {
        correct,
        total: session.questions.length,
        score: Math.round(correct / session.questions.length * 100),
        mistakes: session.answers.filter((answer)=>!answer.correct).map((answer)=>({
                ...answer,
                question: session.questions.find((question)=>question.id === answer.questionId)
            }))
    };
}
export function grammarProgressKey(scope) {
    return `grammar_comparison_${[
        scope.owner,
        scope.language,
        scope.category,
        scope.chapter
    ].map(encodeURIComponent).join(':')}`;
}
export function grammarBookmarkId(language, category, chapter) {
    return [
        language,
        category,
        chapter
    ].map(encodeURIComponent).join(':');
}
export function persistGrammarResult(storage, scope, session, completedAt) {
    if (session.phase !== 'complete' || session.answers.length !== session.questions.length) return null;
    const key = grammarProgressKey(scope);
    let previous = null;
    const stored = storage.getItem(key);
    try {
        previous = JSON.parse(stored || 'null');
    } catch  {}
    if (previous?.sessionId === session.id) return null;
    const result = grammarResult(session);
    const best = typeof previous?.bestScore === 'number' && Number.isFinite(previous.bestScore) ? previous.bestScore : 0;
    const payload = {
        ...result,
        sessionId: session.id,
        completedAt,
        bestScore: Math.max(result.score, Math.min(100, best)),
        ...scope
    };
    storage.setItem(key, JSON.stringify(payload));
    return payload;
}
