# ZKDACloud Responsive Conflict Repair — 2026-09-08

## Scope

This repair consolidates the homepage responsive architecture without redesigning confirmed content, navigation, Product System, Metrics, or motion direction.

## Fixed

1. **Homepage Hero cascade consolidated**
   - Removed multiple historical Hero generations from `css/content.css`.
   - Removed legacy `100svh` Hero sizing.
   - Removed duplicate “final override” / “Figma baseline” Hero patches.
   - Added one canonical Hero responsive block only.

2. **Hero breakpoint contract normalized**
   - `≥1024`: Desktop / Compact Desktop, one continuous Figma-derived scale model.
   - `768–1023`: Tablet Reflow.
   - `≤767`: Mobile Recompose.
   - Eliminated the previous `721–767` lower-grid gap.

3. **Figma source of truth updated**
   - Hero node: `64:34956`.
   - Desktop reference: `1651 × 863`.
   - Reference geometry is reproduced by the fluid tokens at `1651px`: title `100px`, top `78px`, left anchor `36px`, lower grid `356px`.

4. **Full-bleed structural divider unified**
   - Hero Lower Grid top divider now belongs to the stage and spans the full viewport at every width.
   - Desktop vertical divider remains desktop-only.
   - Tablet/mobile use stacked blocks with horizontal separation.

5. **Mobile lower-grid failure repaired**
   - Mobile no longer keeps the desktop 50/50 lower grid.
   - “我们是谁” receives full readable width.
   - Contact email uses fluid typography and text-width underline rather than desktop fixed geometry.
   - At `≤560px`, the accent phrase becomes its own title line so the Hero stays large without horizontal overflow.

6. **Hero Pixel Field scaling aligned**
   - `js/site.js` now derives target cell size from the Figma `120px @ 1651px` reference, capped on ultra-wide screens and with minimum density on tablet/mobile.

7. **Platform Capabilities CSS/JS breakpoint conflict repaired**
   - JavaScript already defined desktop pin/stack at `≥1024px`.
   - CSS previously activated the same absolute/pinned stack from `≥721px`, which could leave `721–1023px` with only the first card visible.
   - CSS now activates desktop pin/stack at `≥1024px`, matching JavaScript.
   - `721–1023px` is readable document flow; `≤720px` keeps the approved mobile sticky stack.

8. **Duplicate non-Hero responsive ranges reduced**
   - Removed repeated copies of the same homepage range blocks and late range-tuning patches.
   - Kept one section-specific responsive range block plus the canonical Hero block.

9. **Source of truth documents updated**
   - `docs/design.md`
   - `docs/source/layout.md`
   - `docs/source/components.md`
   - `docs/source/responsive-system.md`
   - `project-state.yaml`

10. **Source / dist drift repaired**
    - Added `scripts/sync-dist.sh`.
    - `dist/` is now synchronized from source public files.
    - Cache versions for `content.css` and `site.js` updated to `20260908-responsive-consolidation-v1`.

## Explicit component breakpoint exceptions

These are intentional and are not alternate global mobile definitions:

- Navigation: `≤900px` mobile menu.
- Verified Metrics: `≤720px` vertical click accordion.
- Product System: `≤720px` approved stacked mobile composition.
- Platform Capabilities desktop pin/stack: `≥1024px`.

## Static validation completed

- `css/content.css`: parses with zero CSS parser errors.
- `js/site.js`: passes `node --check`.
- `project-state.yaml`: parses successfully.
- No homepage Hero rule still uses `100svh`.
- No legacy Hero “Final Override” / duplicate Figma block remains active.
- Source and `dist` copies of `index.html`, `css/`, `js/`, `pages/`, and `assets/` are synchronized.

### Key fluid geometry

| Width | Hero stage | Title | Top | Lower grid |
| ---: | ---: | ---: | ---: | ---: |
| 1024 | 820 | 78 | 48 | 280 |
| 1280 | 820 | 78 | 60 | 280 |
| 1651 | 863 | 100 | 78 | 356 |
| 1920 | 1004 | 116 | 91 | 414 |
| 2048 | 1071 | 124 | 97 | 442 |
| 2560 | 1200 cap | 132 cap | 104 cap | 470 cap |

## Visual QA still required

The container's Chromium binary does not complete even for `about:blank`, so automated browser screenshots could not be produced in this environment. The code-level and static cascade checks above are complete, but final visual QA should still be run locally at:

`390 / 480 / 600 / 768 / 820 / 1024 / 1280 / 1651 / 1920 / 2048 / 2560`

### One design choice to review together

At `≤560px` the title becomes three lines:

- 打造领先的
- 全面 智能
- AI基础设施平台

This is deliberate: it preserves the large-title ratio without squeezing or horizontal overflow. If the preferred mobile art direction is strictly two lines, we should discuss a separate smaller mobile title scale instead of silently forcing it.
