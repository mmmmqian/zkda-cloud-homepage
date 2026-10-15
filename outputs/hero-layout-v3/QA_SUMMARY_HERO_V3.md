# ZKDACloud Intelligent Computing Hero — Layout V3 QA

Date: 2026-10-11

## Scope

- Removed the visible `PLATFORM CORE COMPUTE ARRAY / REST` strip, divider, spacing, and layout height.
- Retained the Hairline read-out as a visually hidden live `output` node so pointer state remains observable without visible UI.
- Created a Hero-only derivative of the validated V2 Figure. V1 and V2 baselines were not overwritten.
- Increased the Hairline camera scale from `1.46` to `1.84` (+26.0%) and updated Tour points only; geometry and interaction logic are unchanged.
- Raised the Figure container and kept the native 5:4 ratio, shared Hero background, and Full-Canvas composition.
- Added a 768–1100px width rule to prevent the enlarged Figure from entering the copy/CTA area at 1024px.

## Official Hairline checks

- Build: pass — `hairline-compute-array-v2-hero.html`
- Validate: pass — kernel and bench intact; static checks pass.
- Look: pass — frame, read-out, console, stillness, and answer checks pass.
- Answer world point: `43.5,-26.5,24` → viewBox `291,151`, read-out `unit 03`.
- Edge points: `-76,-61,0` → `180,89`; `76,61,0` → `220,268`.
- Rest ink box: `343 × 202`, 54% of the 400 × 320 viewBox.
- 8-shot: all geometry remains inside the viewBox at rest, answer, 240px, low/high intensity, dark, and light states.
- Motion sheet: no jump, crossing, fold, or persistent loop observed; every shot settles within 1.8s.
- Visual review: silhouette remains legible at 240px; centre scheduler is the single rest highlight; answer transfers to one compute package with route response; themes remain readable; no words appear inside the drawing.

## Browser runtime checks

| Viewport | Result |
| --- | --- |
| 1600 × 900 | Pass. Figure 900 × 720; no clipping, overlap, or horizontal overflow. |
| 1280 × 800 | Pass. Figure 768 × 614.4; balanced with copy; no clipping, overlap, or horizontal overflow. |
| 1024 × 768 | Pass. Figure 532.5 × 426; copy and CTA remain clear; no clipping or horizontal overflow. |

- `document.documentElement.scrollWidth === innerWidth` at all three target viewports.
- Figure and Hero computed backgrounds both equal `rgb(249, 250, 252)`.
- Visible page text does not contain `PLATFORM CORE COMPUTE ARRAY`.
- Hidden live status changes `rest → unit 03 → rest` under pointer select and leave.
- Pointer screenshot confirms package lift, selected outline, route highlight, and centre response.
- Runtime console: no warnings or errors.
- Existing IntersectionObserver lifecycle and reduced-motion rules remain in place.

## Screenshots

- `compute-hero-1600x900.png`
- `compute-hero-1280x800.png`
- `compute-hero-1024x768.png`
- `compute-hero-pointer-1024x768.png`

## Source parity

- Source and `dist` HTML checksums match.
- Source and `dist` CSS checksums match.
- Source and `dist` Hero Figure checksums match.
