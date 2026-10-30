# Practical conversation artwork

200 generated illustrations in 10 WebP sheets, one sheet per career path.
Each sheet contains four columns and five rows, ordered left to right, then top to bottom.

The scenes use everyday international settings without language-specific captions,
brands, flags or national landmarks. Reuse the same artwork for any teaching or
support language; there is no locale or CEFR level embedded in the artwork mapping.

The authoritative scenario IDs and measured crop boundaries are in
`src/modules/exercises/scenarioArtwork.mjs`. Use `StudioSceneArtwork` with a stable
`scenarioId` (for example `bus-lost-bag` or `general-hair-appointment`) and `pathId`.
The catalog order and translated titles do not affect image selection.

For another client, reuse the WebP file, dimensions and `viewBox` returned by
`getScenarioArtwork`. Keep slice/cover scaling and clip to that viewBox. The rows
are slightly uneven: do not assume each row is exactly one fifth of the sheet.
The crop inset excludes the seams between scenes.

Style: warm realistic editorial watercolor/gouache, ivory, petrol teal, sage and
ochre, natural adult proportions, varied people and recognizable everyday props.
Keep future assets free of written dialogue, national symbols and destination-specific scenery.
