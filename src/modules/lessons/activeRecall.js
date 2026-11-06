// Adapted from NordLingo Android; content is independent of the renderer.
export const normalizeRecall = (text)=>text.normalize('NFC').toLocaleLowerCase('nb-NO').replace(/[.,!?;:“”„"«»]/gu, ' ').replace(/\s+/gu, ' ').trim();
const sentence = (answer)=>Array.isArray(answer) ? answer.join(' ') : answer;
export function buildActiveRecall(lesson) {
    const points = lesson.grammar.points || [];
    const order = lesson.exercises.find((q)=>q.type === 'order');
    if (!order || !lesson.vocabulary.length) throw new Error('Lecția nu are încă date pentru recapitulare.');
    const orderAnswer = sentence(order.answer);
    const point = points.find((p)=>p.exerciseIndexes?.includes(lesson.exercises.indexOf(order)));
    const previous = (point?.examples || []).find((e)=>normalizeRecall(e.norwegian) !== normalizeRecall(orderAnswer))?.norwegian || lesson.vocabulary.find((e)=>e[2] && normalizeRecall(e[2]) !== normalizeRecall(orderAnswer))?.[2] || '';
    const expression = lesson.vocabulary[1] || lesson.vocabulary[0];
    const article = lesson.exercises.find((q)=>q.type === 'fill' && /^(en|ei|et)$/i.test(q.answer) && q.sentence?.includes('___'));
    let rule;
    if (article && points.some((p)=>p.concept === 'indefinite-articles')) {
        const options = [
            'en',
            'et',
            ...article.answer === 'ei' ? [
                'ei'
            ] : []
        ];
        const noun = lesson.vocabulary.find((e)=>normalizeRecall(e[0]).startsWith(article.answer + ' ') && article.answerSentence?.toLocaleLowerCase('nb-NO').includes(e[0].toLocaleLowerCase('nb-NO')));
        rule = {
            title: 'Alege articolul',
            prompt: article.sentence,
            options,
            answer: options.indexOf(article.answer),
            completion: noun?.[0].toLocaleLowerCase('nb-NO') || article.answerSentence,
            explanation: 'Învață substantivul împreună cu articolul.'
        };
    } else {
        const linked = points.flatMap((p)=>p.exerciseIndexes || []).map((i)=>lesson.exercises[i]).find((q)=>q?.type === 'choice');
        const choice = linked || lesson.exercises.find((q)=>q.type === 'choice');
        if (!choice) throw new Error('Lipsește întrebarea pentru regula lecției.');
        rule = {
            title: 'Aplică regula',
            prompt: choice.prompt,
            options: [
                ...choice.options
            ],
            answer: choice.answer,
            completion: choice.options[choice.answer],
            explanation: choice.explanation || lesson.grammar.rule
        };
    }
    const transfer = lesson.vocabulary.find((e)=>e[2] && e[3] && normalizeRecall(e[2]) !== normalizeRecall(orderAnswer) && normalizeRecall(e[2]) !== normalizeRecall(previous) && e[2].split(/\s+/).length >= 3) || lesson.vocabulary.find((e)=>e[2] && e[3]) || [
        expression[0],
        expression[1],
        expression[0],
        expression[1]
    ];
    const cafe = lesson.uid === 'a1-cafe';
    const response = cafe ? {
        title: 'Comandă fără model',
        task: 'Cere apă și un sandviș. Mulțumește.',
        question: 'Hva vil du bestille?',
        model: 'Jeg vil ha vann og et smørbrød, takk.',
        alternatives: [
            'Jeg vil gjerne ha vann og et smørbrød, takk.',
            'Kan jeg få vann og et smørbrød, takk?',
            'Vann og et smørbrød, takk.',
            'Jeg vil ha et smørbrød og vann, takk.'
        ],
        hint: 'Folosește „Jeg vil ha”, păstrează articolul lui „smørbrød” și încheie cu „takk”.'
    } : {
        title: 'Răspunde fără model',
        task: `Spune în norvegiană: „${transfer[3]}”`,
        question: 'Hvordan sier du det på norsk?',
        model: transfer[2],
        alternatives: [],
        hint: `Folosește expresia din lecție: „${transfer[0]}”.`
    };
    return {
        expression: {
            prompt: expression[1],
            answer: expression[0]
        },
        rule,
        order: {
            ...order,
            title: cafe ? 'Acum cere apă' : 'Schimbă exemplul',
            previous,
            answerText: orderAnswer,
            accepted: [
                order.answer,
                ...order.acceptedAnswers || []
            ].map(sentence)
        },
        response
    };
}
export function checkRecallOrder(plan, words) {
    return plan.order.accepted.some((answer)=>normalizeRecall(words.join(' ')) === normalizeRecall(answer));
}
export function checkRecallResponse(plan, text) {
    if (!text.trim()) return 'empty';
    return [
        plan.response.model,
        ...plan.response.alternatives
    ].some((answer)=>normalizeRecall(answer) === normalizeRecall(text)) ? 'matched' : 'compare';
}
export function recallReviewItem(lesson, level, plan, stage) {
    const base = {
        id: `active-recall:${lesson.curriculumVersion || '1'}:${level}:${lesson.uid}:${stage}`,
        level,
        lessonId: lesson.id,
        source: 'active-recall',
        stage
    };
    if (stage === 'expression') return {
        ...base,
        prompt: `Cum spui în norvegiană: „${plan.expression.prompt}”?`,
        answer: plan.expression.answer
    };
    if (stage === 'rule') return {
        ...base,
        prompt: plan.rule.prompt,
        answer: plan.rule.completion,
        exercise: {
            type: 'choice',
            prompt: plan.rule.prompt,
            options: plan.rule.options,
            answer: plan.rule.answer,
            explanation: plan.rule.explanation
        }
    };
    if (stage === 'order') return {
        ...base,
        prompt: plan.order.prompt,
        answer: plan.order.answerText,
        exercise: plan.order
    };
    return {
        ...base,
        prompt: plan.response.task,
        answer: plan.response.model
    };
}
export function createRecallRecorder(save) {
    const recorded = new Set();
    return (item)=>{
        if (recorded.has(item.id)) return;
        save(item);
        recorded.add(item.id);
    };
}
