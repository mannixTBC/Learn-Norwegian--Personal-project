# Word discovery artwork

The illustrated game deliberately uses a finite bank of 120 Norwegian words. Each word has a specific illustration, a Romanian clue and a category in `src/modules/exercises/wordDiscoveryCatalog.js`. Other lesson and game vocabularies are unchanged.

The ten WebP atlases contain 12 illustrations each, in a strict 3-column, 4-row grid. `tile` is a zero-based row-major index. The UI displays one cell with CSS background positioning; it does not download 120 separate files. Only the current atlas is requested and normal browser caching applies.

Generated using the built-in image generation tool. Shared production prompt: “Premium semi-realistic Nordic storybook gouache and watercolor vignette, fine painterly texture, muted petrol blue shadows, warm golden light, pine greens, soft fjord atmosphere; feathered painted edges on warm ivory #fff8e9; one specified subject per cell; no text, numbers or interface.” Subjects correspond to the catalog in row-major order. The independent background uses muted petrol mountains, fjord water and mist, fading to dark petrol below the keyboard.

Visual reference: the approved word-discovery mockup with the original NordLingo logo and no bottom navigation. A real browser capture is saved in `docs/screenshots/word-discovery-mobile.png`.

Verification: 320×640, 360×800, 390×844, 412×915 and 1280×800; short and long words; Æ/Ø/Å; full five-word session, result screen and local progress persistence.
