# Header Adaptive Theme V1 — Runtime QA

Date: 2026-10-10  
Build: `20261010-adaptive-theme-v91`

## Scope

- Explicit section ownership through `data-header-theme="light|dark"`.
- Header theme probe at the first pixel below the rendered Header.
- Stable Mosaic handoff: the light zone and Mosaic frontier own `light`; the Final CTA dark zone and Footer own `dark`.
- Existing Modal Hover V3 dropdown state and mobile click behavior remain unchanged.

## Runtime geometry

- Rendered Header height: `63px`.
- Probe position: `Math.ceil(header.getBoundingClientRect().bottom) + 1`, therefore `64px` in the verified desktop states.
- Forward boundary: dark-zone top `76.226px` remains Light; dark-zone top `57.726px` becomes Dark.
- Reverse boundary: dark-zone top returns to `76.226px` and restores Light.

Mosaic cells are not sampled. Theme state changes only when the configured dark-zone boundary crosses the probe, so colored cells cannot cause theme flicker.

## Visual states

- Light: existing light surface (`rgba(255,255,255,.96)` at runtime), `#11110f` ink, dark logo, `#f3f4f5` Hover/Open pill.
- Dark: `#020801` surface, white ink and logo, `rgba(255,255,255,.16)` divider, `#1a211e` Hover/Open pill.
- The primary CTA remains `#1b58f4` in both themes.

## Interaction QA

- Product dropdown remains open while the page crosses between Light and Dark.
- Dropdown panel remains a light reading surface with dark text in both Header themes.
- Desktop hover, focus open, delayed close, Escape close and `aria-expanded` remain functional.
- Mobile at `768×900`: the established click menu opens on its light full-screen surface while underlying Header theme remains Dark; no horizontal overflow.
- `prefers-reduced-motion` removes crossfades without changing state ownership.

## Responsive QA

| Viewport | Header height | Nav center spread | Horizontal overflow | Result |
|---|---:|---:|---:|---|
| 1600×800 | 63px | 0px | 0px | Pass |
| 1280×800 | 63px | 0px | 0px | Pass |
| 1024×800 | 63px | 0px | 0px | Pass |
| 768×900 | 63px | n/a (mobile menu) | 0px | Pass |

Browser console: `0` errors, `0` warnings.

## Contrast

| Pair | Ratio |
|---|---:|
| `#11110f` / `#ffffff` | 18.90:1 |
| `#ffffff` / `#020801` | 20.24:1 |
| `#11110f` / `#f3f4f5` | 17.17:1 |
| `#ffffff` / `#1a211e` | 16.40:1 |
| `#ffffff` / `#1b58f4` | 5.60:1 |

All verified navigation and CTA text pairs meet WCAG AA `4.5:1`.

## Files

- `index.html`
- `css/site.css`
- `js/site.js`
- synchronized `dist/` equivalents

