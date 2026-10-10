# Core Advantages SVG Illustration Runtime QA

Date: 2026-10-09

## Scope

- Replaced only the six images inside `[data-advantage-panel]`.
- Preserved the existing `.core-advantages__visual` geometry, background, crop, responsive rules and opacity crossfade.
- Preserved the existing tab Hover, Click, keyboard and selected-state behavior.
- Kept each SVG file unchanged so its embedded CSS / SMIL line animation and reduced-motion rule remain authoritative.

## Mapping

| State | Advantage | Asset |
| --- | --- | --- |
| 01 | 一云多芯，打破算力壁垒 | `01_multi_chip.svg` |
| 02 | 平滑迁移 | `02_smooth_migration.svg` |
| 03 | 技术降本 | `03_cost_optimization.svg` |
| 04 | 安全可控 | `04_security_control.svg` |
| 05 | 智能运维 | `05_intelligent_operations.svg` |
| 06 | 行业知识 | `06_industry_knowledge.svg` |

## Runtime results

- 1651×1000: panel `441.39×818px`; active SVG natural size `441×818`; no horizontal overflow.
- 768×1024: panel `230.40×774px`; active SVG natural size `441×818`; no horizontal overflow.
- 390×844: panel `390×358.80px`; active SVG natural size `441×818`; no horizontal overflow.
- Programmatically selected all six states: each selected row mapped to the expected SVG path and the panel retained exactly six visual layers.
- Console: 0 errors, 0 warnings.
- Source and `dist` assets are byte-identical; `node --check` passed for both JavaScript bundles.

## Motion ownership

The website only controls which visual layer is active. The illustration motion remains inside each SVG. Re-activating a state replaces only that SVG image node so its one-shot intrinsic line animation starts again; no preview-page background, hit areas, timers or alternate interaction state were imported.
