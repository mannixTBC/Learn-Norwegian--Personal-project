# Verbe

The installed app uses the cream, teal and gold expedition design. Desktop web uses the existing exercise layout with the same learning sequence. All 60 session IDs and the legacy `challenge_verbs_progress_LEVEL` completion/unlock keys remain compatible with the Games hub.

Each session introduces three verbs, then revisits them in three stages: meaning, a contextual choice with an explicit Romanian intention, and recall without answer choices. Up to two introduced verbs return for review. The first session has nine graded questions; sessions with two eligible review verbs have eleven. A learner is never assumed to know a lower level merely because they select a higher one.

Norwegian forms, translations and two usage contexts are authored in `verbPracticeContent.js`. There is no generated conjugation or placeholder sentence. An added curriculum verb requires authored practice content. Accepted alternatives are explicit, and neither recall nor its hint reveals the infinitive.

Checking and continuing are separate actions. Previous answers remain readable and cannot be rescored. Mistakes and assisted answers allow completion and enqueue a recall question for the affected verb. Successful repetition updates its label to “Repetat astăzi” while retaining the first-attempt score. Repetition cannot issue a second study reward.

Per-verb practice evidence is stored separately by user and level under `verb_practice_progress:v1:USER:LEVEL`. It records attempts, the last practice date, a review date and whether more practice is needed. Completed rounds are deduplicated and retained for retrying a failed save. Review selection prioritizes weak verbs, then due verbs, then recent introduced verbs.

Run `npm run test:verbs` for data coverage, session and persistence logic, and real browser checks of mobile and desktop interaction. The mobile regression suite also completes the final C2 session through the new sequence.
