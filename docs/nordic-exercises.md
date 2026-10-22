# Nordic exercise theme

The vocabulary, sentence builder, listening, work missions, verb practice, pronunciation and review screens share the dark fjord background, original logo, warm ivory cards and gold actions. Each retains its own interaction and persistence. Word Discovery and the course final test retain their original layouts.

`NordicExerciseUI.js` provides the header, progress and reusable sprite artwork. `NordicExercises.css` scopes the theme to `.nordic-exercise`. Existing Word Discovery illustrations are reused without changing the source files. Only career-specific mission scenes use the additional sprite sheet. Listening deliberately has no illustration that could disclose an answer; recall uses a neutral library scene.

## Validation

- Production client build.
- `npm run test:games`: listening across A1–C2, playback gate, failures, mission career selection, duplicate answers, retry and progress.
- `npm run test:mobile-exercises`: vocabulary, sentence tokens, verb matching and completion, pronunciation recording state and cleanup, review reveal/rating/persistence.
- `node scripts/test-word-discovery.mjs`: the existing illustrated word game.
- Real Chromium: all seven screens at 320×640/C2, 390×844/A1 and 1280×800/B2, with no horizontal overflow. Browser flows checked vocabulary verify/next, sentence assemble/undo/verify, review reveal/rate and saved rating.
- Word Discovery at 390×844 with H/S guessed: pixel-identical screenshot against the previous worktree.

Actual mobile screenshots are in `docs/screenshots/other-games/`. Text can scroll vertically on small devices; long content is not cropped. Audio service quality and actual microphone hardware require the deployed service and device.
