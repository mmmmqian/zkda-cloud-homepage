# CAPABILITIES Fullscreen Sticky Stage — Runtime QA

Date: 2026-10-09

## Geometry contract

- `headerHeight = siteHeader.getBoundingClientRect().height`
- `stageHeight = 100dvh - headerHeight`
- `collapsedHeight = 76px`
- `cardOffset(index) = index × collapsedHeight`
- `activeHeight(index) = stageHeight - cardOffset(index)`
- Desktop / Tablet columns: `50% / 50%`
- Interactive breakpoint: `min-width: 721px`
- Mobile (`max-width: 720px`) keeps the prior sticky-card composition.

## Runtime measurements

| Viewport | Header | Stage | Expected | Columns | Horizontal overflow |
|---|---:|---:|---:|---|---:|
| 1920×1080 | 63.5px | 1016.5px | 1016.5px | 960 / 960 | 0 |
| 1600×900 | 63.5px | 836.5px | 836.5px | 800 / 800 | 0 |
| 1440×900 | 63.5px | 836.5px | 836.5px | 720 / 720 | 0 |
| 1280×800 | 63.5px | 736.5px | 736.5px | 640 / 640 | 0 |
| 1024×768 | 63px | 705px | 705px | 512 / 512 | 0 |
| 900×768 | 62px | 706px | 706px | 450 / 450 | 0 |
| 768×1024 | 62px | 962px | 962px | 384 / 384 | 0 |
| 1280×720 | 63.5px | 656.5px | 656.5px | 640 / 640 | 0 |
| 1280×1000 | 63.5px | 936.5px | 936.5px | 640 / 640 | 0 |

## Interaction path

- Forward sampling reached `01 → 03 → 05 → 06` while Stage remained sticky at the live Header bottom.
- Reverse sampling reached `06 → 05 → 03 → 01` through the same rounded progress mapping.
- Card 06 receives a stable read interval before the existing track release.
- The next section enters after release without a second sticky stage or an added runway.
- Browser console: no warning/error, including no ResizeObserver loop warning.

## Preserved behavior

- `Math.round(progress × 5)` state selection.
- 620ms top transition and easing.
- 01–06 order, card colors, copy, icons and illustrations.
- Card 05 / 06 color swap.
- Reduced-motion static fallback.
- Existing mobile sticky-card interaction.
