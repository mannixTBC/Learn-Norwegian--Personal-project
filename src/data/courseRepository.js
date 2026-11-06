import { joinContent } from './contentCodec.mjs';
export function decodeCourseLevel(document, manifest, level, supportLanguage) {
    if (document?.formatVersion !== 1 || document.courseId !== manifest.courseId || document.version !== manifest.version
        || document.level !== level || document.supportLanguage !== supportLanguage || !Array.isArray(document.items))
        throw new Error('Course identity mismatch');
    const expected = manifest.levels[level]?.lessons;
    if (!expected)
        throw new Error('Unknown course level');
    const metadata = document.items.filter((item) => item.kind === 'level');
    const rows = document.items.filter((item) => item.kind === 'lesson').sort((a, b) => a.position - b.position);
    if (metadata.length !== 1 || rows.length !== expected.length || document.items.length !== rows.length + 1)
        throw new Error('Incomplete course level');
    const lessons = rows.map((row, index) => {
        const expectedLesson = expected[index];
        if (row.itemId !== expectedLesson.uid || row.legacyId !== expectedLesson.id || row.position !== index + 1)
            throw new Error('Lesson identity mismatch');
        const lesson = joinContent(row.payload, row.strings);
        if (lesson.uid !== expectedLesson.uid || lesson.id !== expectedLesson.id || lesson.curriculumVersion !== manifest.version)
            throw new Error('Lesson payload mismatch');
        return lesson;
    });
    const meta = joinContent(metadata[0].payload, metadata[0].strings);
    if (meta.code !== level || meta.curriculumVersion !== manifest.version || !Array.isArray(meta.sections))
        throw new Error('Invalid course metadata');
    const sections = meta.sections.map(({ lessonIds, ...section }) => {
        if (!Array.isArray(lessonIds))
            throw new Error('Invalid lesson section');
        return { ...section, lessons: lessonIds.map((id) => {
                const lesson = lessons.find((item) => item.id === id);
                if (!lesson)
                    throw new Error('Missing section lesson');
                return lesson;
            }) };
    });
    return { ...meta, lessons, sections };
}
// A level stays fixed for this process. Refreshes are atomic and become visible on
// the next application start, never half way through an exercise.
export function createCourseRepository({ storage, fetchLevel, manifest, onError = () => { } }) {
    const pinned = new Map(), pending = new Map(), checked = new Set();
    const key = (level, support) => `nl_content_v1:${manifest.courseId}:${manifest.version}:${support}:${level}`;
    function refresh(level, support) {
        const id = key(level, support);
        if (pending.has(id))
            return pending.get(id);
        const task = (async () => {
            try {
                const document = await fetchLevel(level, support);
                decodeCourseLevel(document, manifest, level, support);
                storage.setItem(id, JSON.stringify(document));
            }
            catch (error) {
                onError(error);
            }
            finally {
                pending.delete(id);
            }
        })();
        pending.set(id, task);
        return task;
    }
    return { refresh, level(level, pair, bundled) {
            if (pair.learningLanguage !== manifest.learningLanguage)
                throw new Error('Wrong course language');
            const id = key(level, pair.supportLanguage);
            if (!pinned.has(id)) {
                let course = bundled;
                try {
                    const cached = storage.getItem(id);
                    if (cached)
                        course = decodeCourseLevel(JSON.parse(cached), manifest, level, pair.supportLanguage);
                }
                catch (error) {
                    onError(error);
                }
                pinned.set(id, course);
            }
            if (!checked.has(id)) {
                checked.add(id);
                void refresh(level, pair.supportLanguage);
            }
            return pinned.get(id);
        } };
}
