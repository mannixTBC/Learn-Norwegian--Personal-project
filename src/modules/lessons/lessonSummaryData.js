// Adapted from NordLingo Android; content is independent of the renderer.
export function buildLessonSummary(lesson) {
    const wordRank = (text)=>{
        const count = text.trim().split(/\s+/).length;
        if (/^(en|ei|et)\s+/i.test(text)) return 0;
        if (count === 1) return 1;
        return (text.includes('?') ? 4 : 2) + count / 10;
    };
    const ranked = lesson.vocabulary.map((entry, index)=>({
            entry,
            index
        })).sort((a, b)=>wordRank(a.entry[0]) - wordRank(b.entry[0]) || a.index - b.index);
    const selected = new Set(ranked.slice(0, 4).map((item)=>item.index));
    const vocabulary = lesson.vocabulary.filter((_, index)=>selected.has(index));
    const remaining = lesson.vocabulary.filter((_, index)=>!selected.has(index));
    const expressions = (remaining.length >= 2 ? remaining : lesson.vocabulary).slice(0, 2).map((entry)=>/\?|^(en|ei|et)\s+/i.test(entry[0]) && entry[2] && entry[3] ? [
            entry[2],
            entry[3]
        ] : entry);
    const point = lesson.grammar.points?.[0];
    const explanation = point?.explanation || lesson.grammar.rule;
    const rule = explanation.split(/(?<=[.!?])\s+(?=[A-ZĂÂÎȘȚ„])/u)[0];
    const example = point?.examples[0]?.norwegian || lesson.grammar.examples[0]?.split(/\s+[—–]\s+/)[0] || '';
    const speakers = [
        ...new Set(lesson.dialogue.map((line)=>line[0]))
    ];
    return {
        objective: lesson.objectives.slice(0, 2).join(', ').replace(/[.!]$/, '') + '.',
        vocabulary,
        expressions,
        rule,
        example,
        focus: point?.focus || [],
        dialogue: lesson.dialogue.slice(0, 3).map(([speaker, text, translation])=>({
                speaker,
                text,
                translation,
                label: String.fromCharCode(65 + speakers.indexOf(speaker))
            }))
    };
}
export function findSummaryLesson(lessons, lessonId) {
    return lessons.find((lesson)=>lesson.id === Number(lessonId)) || lessons[0];
}
