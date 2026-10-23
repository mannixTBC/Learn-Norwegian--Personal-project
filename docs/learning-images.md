# Shared learning illustrations

`src/modules/exercises/learningImageCatalog.js` exposes the 120 existing, individually mapped illustrations from the discovery catalog. Each entry has a stable ID, category, Norwegian/Romanian tags, description, asset path and sprite coordinates (3 columns × 4 rows). Original files and the discovery game are unchanged.

Sentence exercises store `imageId` when their question data is created. Matching uses whole Norwegian words, never substrings. Exactly one matching object is required; absent or ambiguous matches produce `null`, with a text-only card. No AI or external image requests are involved. A failed image request also removes the illustration area.

Coffee example: `Jeg drikker kaffe om morgenen` maps to `illustrated-drinks-kaffe`, tile 0 of `drinks.webp`. This illustrates coffee, not an invented scene of a person drinking it.

Other exercises can reuse `getLearningImage(id)` without changing their source files or copying assets. For future people/action illustrations, add separately reviewed entries describing the actual action and context; do not infer actions from generic portraits. Explicit exercise mappings can use a reviewed catalog ID or null. Extend tags and category metadata as new artwork is added.
