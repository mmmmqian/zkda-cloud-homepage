# ADVANTAGES SVG Safe Render V81 — Runtime QA

Date: 2026-10-09  
URL: `http://127.0.0.1:8001/?advantagesqa=render-fix-v81#advantages`

## Implementation proof

- Host: `#advantage-panel`; its existing layout/background CSS was not changed.
- Renderer: `js/safe-advantage-svg.js`.
- Isolation: one open Shadow DOM containing `.frame > .native > inline svg`.
- Native drawing canvas: CSS width/height `441px × 818px`; SVG `viewBox="0 0 441 818"`.
- Responsive scale owner: `.native` transform only.
- Fit: `contain`, so peripheral cubes, connections and bottom perspective geometry remain visible.
- State owner: the existing `setActiveAdvantage()` flow; the renderer only receives the selected index.

## Desktop six-state completion

After waiting for each intrinsic line animation to complete:

| State | SVG label | Paths | Animated traces | Non-zero final dash offsets |
| --- | --- | ---: | ---: | ---: |
| 01 | 一云多芯 | 48 | 31 | 0 |
| 02 | 平滑迁移 | 41 | 27 | 0 |
| 03 | 技术降本 | 41 | 26 | 0 |
| 04 | 安全可控 | 26 | 12 | 0 |
| 05 | 智能运维 | 16 | 11 | 0 |
| 06 | 行业知识 | 42 | 30 | 0 |

Visual inspection confirmed closed upper/lower cube outlines, complete central subjects, connection paths and bottom perspective structures.

## Responsive geometry

| Viewport | Panel | Native SVG CSS size | Wrapper result | Horizontal overflow | Final unfinished traces |
| --- | --- | --- | --- | ---: | ---: |
| 1651×1000 | 441.39×818 | 441×818 | scale 1 | 0 | 0 |
| 768×1024 | 230.40×774 | 441×818 | scale 0.522445 | 0 | 0 |
| 390×844 | 390×358.80 | 441×818 | scale 0.438627 | 0 | 0 |

The SVG drawing canvas does not change size at any breakpoint; only the wrapper transform changes.

## Switching and isolation

- Rapid sequence 01 → 06 → 03 resolved to state 03.
- Shadow root contained exactly one SVG after the sequence.
- Final state 03 had zero unfinished dash traces.
- Console errors/warnings: 0.
- No page horizontal overflow at tested breakpoints.

## Scope confirmation

No changes were made to the ADVANTAGES right-side list, copy, colors, dividers, panel geometry, responsive section layout, section spacing or other modules. SVG CSS/SMIL remains the sole owner of illustration motion; no page-level duplicate animation was introduced.
