# project002 — Responsive V4 Alignment Report

Date: 2026-09-09

## Scope

This pass aligns the previously consolidated `project002` responsive implementation with `ZKDACloud Responsive DESIGN V4` and the confirmed Tablet decision: **Hero Lower Grid stays 50 / 50 at 768–991px**.

No new visual direction was introduced. The pass focuses on removing logic conflicts and making component behavior monotonic and predictable.

## Confirmed implementation decisions

### Homepage Hero

- `>=992px`: Figma-derived desktop / compact-desktop grammar.
- `768–991px`: preserve the approved 50 / 50 Lower Grid.
- Tablet compresses typography and padding instead of stacking the two columns.
- `<768px`: this specific Hero selectively reflows the Lower Grid to one column because the approved Chinese paragraph and long contact email no longer sustain a useful 50 / 50 split.
- Full-bleed Lower Grid top divider remains full width at every viewport.
- Center vertical divider remains active at `>=768px`; below `768px` it becomes horizontal block separation.
- Hero Pixel Field density now uses the same `992px` desktop-grammar boundary.

### Product System

Fixed a real non-monotonic conflict:

- Before: `>=1024` two columns → `901–1023` intro became one column → `<=900` became two columns again → `<=720` mobile stack.
- After: `>=721px` keeps the approved two-column grammar; `<=720px` uses the approved mobile stack.

The Product System intro therefore no longer reverses layout at `900/901`.

### Platform Capabilities

Kept as a documented component-specific structural exception:

- `>=1024px`: desktop two-column + pinned stack choreography.
- `<1024px`: document-flow/reoriented layout.

This is intentional because the desktop composition depends on pinned choreography; it is not treated as a global Tablet breakpoint definition.

### Navigation / Metrics exceptions retained

- Navigation mobile menu: `<=900px`.
- Verified Metrics mobile vertical accordion: `<=720px`.
- Product System mobile stack: `<=720px`.
- Platform Capabilities heavy/pinned desktop behavior: `>=1024px`.

## Documentation synchronized

Updated:

- `docs/design.md`
- `docs/source/layout.md`
- `docs/source/components.md`
- `docs/source/responsive-system.md`
- `project-state.yaml`

The project documentation now uses the V4 global semantic ranges:

- `>=2560` Ultra Wide
- `1920–2559` Large Desktop
- `1600–1919` Wide Desktop / Baseline
- `1280–1599` Standard Desktop
- `992–1279` Compact Desktop
- `768–991` Tablet / Preserve Grammar
- `480–767` Mobile Landscape / Selective Reflow
- `<=479` Mobile Portrait / Recompose

## Static verification

Passed:

- `css/content.css`: zero top-level CSS parse errors via `tinycss2`.
- `js/site.js`: `node --check` passes.
- `project-state.yaml`: parses successfully.
- Canonical Hero media contract found at `992`, `768–991`, and `<768` without a `992–1023` Hero mode conflict.
- Hero Pixel Field density uses `768 / 992` thresholds.
- Product System no longer receives a tablet single-column intro override in `768–1023`.

## Browser QA status

Automated Chromium screenshot capture is not reliable in this execution environment (headless Chromium hangs on startup / DBus initialization), so this pass does **not** claim visual browser QA.

Recommended manual visual regression widths:

`390 / 479 / 480 / 600 / 767 / 768 / 820 / 900 / 901 / 991 / 992 / 1023 / 1024 / 1280 / 1651 / 1920 / 2048 / 2560`

Highest-priority comparisons:

1. `767 vs 768` — Hero Lower Grid stack → 50/50 transition.
2. `991 vs 992` — Tablet preserved grammar → Figma-derived desktop grammar.
3. `900 vs 901` — Navigation changes, Product System must **not** change geometry.
4. `1023 vs 1024` — Platform Capabilities motion/layout exception only.
5. `1651` — Figma Hero baseline fidelity.
