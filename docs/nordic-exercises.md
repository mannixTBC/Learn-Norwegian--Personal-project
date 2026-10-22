# Nordic exercise theme

The installed-app games share petrol, ivory and gold, consistent exit controls and readable actions, with layouts shaped by each activity. `GameFamilies.css` extends the existing Nordic styles and is scoped to `html.is-installed-app`. The web version retains its separate page chrome; structural rules in `PracticeGame.css` support the shared puzzle interactions there.

`NordicExerciseUI.js` provides the compact header, progress and reusable mission artwork. Vocabulary checks a single choice immediately, locks the answered choices and lets the learner continue at their own pace. Sentence building keeps explicit verification, removable word pieces and undo. Verb matching has labelled columns and a clear next action. Work missions separate the context and speaker from the learner's answer. Review uses a quiet light surface, without decorative artwork or premature answer clues.

Listening keeps its existing playback gate and automatic progression after correct answers, with an explicit continue button as well. Pronunciation distinguishes the model from recording and disables model playback while recording or processing. The Word Discovery layout, illustrations and lesson final test are outside this redesign.

## Current validation (2026-10-22)

- `npm run test:mobile-exercises`: A1–C2 content, immediate vocabulary feedback, repeated taps, complete sentence verification, verb matching and writing, microphone cleanup and review persistence.
- `npm run test:games`: missions, listening gates, errors, scoring and retries.
- `node scripts/test-word-discovery.mjs`: existing word-game interactions and all 120 illustrated entries.
- `npm run build:client`: production client compilation.
- Visual QA now uses the published installed-app preview (`?appPreview=1`), since the local preview was serving older screens. Checked at 390×844 and 320×640: vocabulary choices and correct/wrong feedback; sentence assembly, undo and verification; verb steps and matching, including C2 phrases; both mission stages; listening playback gate and automatic progression; pronunciation layout and phrase navigation; review empty/revealed states and rating controls; and the preserved Word Discovery screen.
- QA found that feedback could be visible while the next action remained below the viewport. Puzzle and mission feedback now bring the result and continuation into view together. Review reveal focuses the answer and brings its rating controls into view. The last verb tab is labelled “Scrie” so it fits narrow screens.
- These checks cover browser layout and interaction. Actual microphone recording, pronunciation scoring on device and an installed APK are not covered by this visual pass. The screenshots below remain an earlier baseline.

## Previous visual baseline

- Production client build.
- `npm run test:games`: listening across A1–C2, playback gate, failures, mission career selection, duplicate answers, retry and progress.
- `npm run test:mobile-exercises`: vocabulary, sentence tokens, verb matching and completion, pronunciation recording state and cleanup, review reveal/rating/persistence.
- `node scripts/test-word-discovery.mjs`: the existing illustrated word game.
- Real Chromium: all seven screens at 320×640/C2, 390×844/A1 and 1280×800/B2, with no horizontal overflow. Browser flows checked vocabulary verify/next, sentence assemble/undo/verify, review reveal/rate and saved rating.
- Word Discovery at 390×844 with H/S guessed: pixel-identical screenshot against the previous worktree.

Actual mobile screenshots are in `docs/screenshots/other-games/`. Text can scroll vertically on small devices; long content is not cropped. Audio service quality and actual microphone hardware require the deployed service and device.
