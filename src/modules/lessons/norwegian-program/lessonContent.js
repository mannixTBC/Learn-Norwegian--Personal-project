import { a1Sections, a2Sections } from './curriculum/a1a2';
import { b1Sections, b2Sections } from './curriculum/b1b2';
import { c1Sections, c2Sections } from './curriculum/c1c2';
import { compileCurriculum } from './curriculum/compileCurriculum';

export const courseCatalog = compileCurriculum({ A1: a1Sections, A2: a2Sections, B1: b1Sections, B2: b2Sections, C1: c1Sections, C2: c2Sections });
export const courseLessons = courseCatalog.A1.lessons;
