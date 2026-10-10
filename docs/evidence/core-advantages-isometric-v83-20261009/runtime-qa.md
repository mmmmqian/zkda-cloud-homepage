# ADVANTAGES Isometric Geometry V83 — Runtime QA

- Date: 2026-10-09
- Scope: six ADVANTAGES inline SVG illustrations and the project-local `ZKDACloud_CoreAdvantages_FigmaPreview.html`
- QA URL: `http://127.0.0.1:8001/?advantagesqa=isometric-v83#advantages`
- Preview URL: `http://127.0.0.1:8001/ZKDACloud_CoreAdvantages_FigmaPreview.html`

## Geometry contract

- Native drawing canvas remains `441 × 818`, `viewBox="0 0 441 818"`.
- A single `0.54` rise/run ratio owns every isometric left/right edge.
- Cube top faces, cube bottom edges, carrier planes, auxiliary diamonds and peripheral module planes use the same ratio.
- Cube side edges and the composition spine remain vertical.
- Scene 04 nested protection frames retain their original width/height envelope, while their diagonal shoulders now use the shared axis.
- Scene 06 network routing uses only vertical, `+0.54`, or `-0.54` segments.
- The subtle background reference lattice uses the same two diagonal families plus one central vertical axis.

## Static verification

- Six SVG files parse successfully with `xmllint` in source and `dist`.
- 49 detected symmetric diamonds across the six source SVGs have maximum slope deviation `0.0006` from the `0.54` target, caused only by one-decimal serialization.
- All six assets retain a transparent SVG root and the native `441 × 818` dimensions.
- `node --check` passes for source and dist `js/site.js`; source/dist JavaScript is byte-identical after sync.

## Browser verification

- Checked all six states in the project-local Figma preview after intrinsic motion completed.
- Checked the production homepage through the existing right-list Click/Active state machine; no interaction rewrite was introduced.
- Scene 01: center cube, three carrier planes, satellite cubes and central vertical axis read as one spatial system.
- Scene 02: center cube and adapter plane are parallel; peripheral source/target semantics remain unchanged.
- Scene 03: all three stacked planes are parallel to the center cube base.
- Scene 04: center cube, support plane and three protection frames share the same diagonal directions.
- Scene 05: circular observability/radar semantic remains unchanged; only the common reference lattice is isometric.
- Scene 06: hub cube, support plane, peripheral modules and network bends share one axis system.
- Console: 0 errors, 0 warnings in both production page and project-local preview.
- No new clipping, background rectangle, or horizontal overflow was observed.

## Preserved behavior

- Existing `pathLength="1"`, CSS trace animation and SMIL motion remain intact.
- Existing Shadow DOM safe renderer, native-canvas wrapper scaling and `contain` fit remain intact.
- Existing transparent-background ownership remains intact.
- ADVANTAGES layout, illustration host size/position, right list, text, dividers and Hover/Click/keyboard switching remain unchanged.

