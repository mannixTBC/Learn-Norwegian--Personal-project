# Exercise page layout

- Exercise pages must use the shared outer canvas in `src/modules/exercises/ExerciseCanvas.css` (imported by `src/App.js`). Keep the document, body, React root and App on the exercise surface, including below short cards, empty states and result screens.
- Do not fix blank space by clipping page content with `overflow:hidden`, adding an extra viewport of minimum height under a visible navbar, or reserving padding for hidden navigation/footer bars.
- For a new standalone exercise, register its root selector and surface in the shared canvas and add it to `scripts/test-exercise-canvas.mjs`. Prefer the existing `.exercise-screen` wrapper when applicable.
- After exercise layout changes, run `npm run test:exercise-canvas` and the relevant game checks. Check web and installed-app modes, both short and long content, and navigation away from the exercise.
