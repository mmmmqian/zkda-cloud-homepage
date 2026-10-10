# CAPABILITIES Scroll Step V78 — Runtime QA

Date: 2026-10-09

## Root cause

The stage and expanded-card geometry had been made viewport-aware, but `.platform-capabilities__scroll` still used the legacy fixed `height: 430svh`. The active index mapping divides the effective scroll range by five takeovers, so the real per-card distance stayed around `0.73 × stageHeight` and a normal inertial gesture could cross multiple thresholds.

## Geometry

New formulas:

```text
scrollStep = 1.05 × stageHeight
scrollRange = (cardCount - 1) × scrollStep
trackHeight = stageHeight + scrollRange
```

| Viewport | Stage | Before step | Before track | After step | After track | Ratio |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1600×900 | 836.5px | 606.7px | 3870px | 878.325px | 5228.125px | 1.05 |
| 1280×800 | 736.5px | 540.7px | 3440px | 773.325px | 4603.125px | 1.05 |
| 1024×768 | 705px | 519.5px | 3302.398px | 740.25px | 4406.25px | 1.05 |

All three viewports reported zero horizontal overflow.

## Input checks

- 1600×900: one PageDown moved 880px and Card 03 → 04; PageUp moved -880px and Card 04 → 03.
- 1280×800: one PageDown moved 780px and Card 02 → 03; PageUp returned Card 03 → 02.
- 1024×768: one PageDown moved 748px and Card 02 → 03; PageUp returned Card 03 → 02.
- Consecutive input remains distance-driven. There is no Wheel interception, Scroll Snap, timed autoplay, or artificial one-index-per-frame limiter.

## Resize and release

- Card 04 stayed active through 1600×900 → 1280×800 → 1024×768 → 1600×900.
- The CSS step updated 878.325px → 773.325px → 740.25px → 878.325px.
- Card 06 stable state ended with the track and stage bottoms aligned at the viewport bottom; the next PageDown released the stage normally into Core Advantages.
- Browser console: zero errors and zero warnings.
