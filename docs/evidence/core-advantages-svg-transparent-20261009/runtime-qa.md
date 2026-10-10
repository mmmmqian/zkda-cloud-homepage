# ADVANTAGES SVG Transparent Background V82 — Runtime QA

Date: 2026-10-09  
URL: `http://127.0.0.1:8001/?advantagesqa=transparent-v82#advantages`

## Root cause

- None of the six SVG files contained a full-canvas background `<rect>`.
- Every SVG root style declared `svg{background:#F9FAFC}`.
- `.core-advantages__visual` independently declared `background:#f1f3f3`.
- The ADVANTAGES Section surface is `var(--home-paper)` / runtime `rgb(249, 250, 252)`, so the panel background created the visible rectangle.

## Fix

- All six SVG root backgrounds: `transparent`.
- `.core-advantages__visual` background: `transparent`.
- Shadow host, `.frame`, `.native` and inline SVG all compute to transparent.
- No new approximation color, overlay or masking layer was added.

## Six-state verification

For states 01–06, both immediately after switching and after the intrinsic animation completed:

- Panel background: `rgba(0, 0, 0, 0)`.
- SVG background: `rgba(0, 0, 0, 0)`.
- Full-canvas background rect count: `0`.
- Final unfinished dash traces: `0`.

This also confirms no temporary white plate is present while a new SVG is being fetched and mounted.

## Responsive verification

| Viewport | SVG CSS canvas | Wrapper scale | Panel/SVG background | Horizontal overflow | Final unfinished traces |
| --- | --- | ---: | --- | ---: | ---: |
| 1651×1000 | 441×818 | 1 | transparent / transparent | 0 | 0 |
| 768×1024 | 441×818 | 0.522445 | transparent / transparent | 0 | 0 |
| 390×844 | 441×818 | 0.438627 | transparent / transparent | 0 | 0 |

Visual inspection confirmed a continuous Section background at all three sizes. Auxiliary grids, perspective lines, nodes, blue fills and complete outer structures remain visible.

## Scope confirmation

The V81 Shadow DOM renderer, native `441×818` drawing canvas, wrapper-only scaling and existing ADVANTAGES Hover / Click / keyboard state machine are unchanged. No other section layout or style was modified. Source was browser-verified before being synchronized to `dist`; console errors/warnings remained zero.
