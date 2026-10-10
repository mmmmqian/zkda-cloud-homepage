# CAPABILITIES Minimum Height Runtime QA

Date: 2026-10-09  
URL: `http://127.0.0.1:8001/?capabilitiesqa=minheight-v76#capabilities-title`

## Measured minimum height

The stage minimum is derived from live content rather than a fixed viewport preset:

```text
availableHeight = viewportHeight - headerHeight
leftRequiredHeight = topPadding + headingHeight + summaryHeight + bottomPadding
cardRequiredHeight = max(
  cardIndex * collapsedHeight
  + expandedHeaderHeight
  + max(copyHeight, visualHeight)
  + bodyBlockPadding
)
minimumStageHeight = ceil(max(leftRequiredHeight, cardRequiredHeight))
stageHeight = max(availableHeight, minimumStageHeight)
```

At 1920px wide the governing case is Card 06:

```text
5 * 76px collapsed rows = 380px
84px expanded header + 146px visual + 36px body padding = 266px
minimumStageHeight = 646px
```

| Width | Left required | Card required / minimum |
| --- | ---: | ---: |
| 1920 | 302px | 646px |
| 1440 | 279px | 640px |
| 1280 | 262px | 638px |
| 1024 | 259px | 590px |
| 900 | 246px | 590px |
| 768 | 242px | 590px |

## Height matrix

Header border-box measured 63.5px in the test runtime.

| Viewport | Available | Minimum | Stage | Overflow below viewport | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| 1920×1080 | 1016.5 | 646 | 1016.5 | 0 | fullscreen |
| 1920×900 | 836.5 | 646 | 836.5 | 0 | fullscreen |
| 1920×768 | 704.5 | 646 | 704.5 | 0 | fullscreen |
| 1920×600 | 536.5 | 646 | 646 | 109.5 | natural page overflow |
| 1440×900 | 836.5 | 640 | 836.5 | 0 | fullscreen |
| 1440×600 | 536.5 | 640 | 640 | 103.5 | natural page overflow |
| 1280×800 | 736.5 | 638 | 736.5 | 0 | fullscreen |
| 1280×600 | 536.5 | 638 | 638 | 101.5 | natural page overflow |

All matrix points retained 50/50 columns, had no horizontal overflow, and had no independent card or stage scrollbar.

## Resize and motion checks

- Established Card 03 as active at 1920×900.
- Resized to 1920×600: active Card 03 retained; stage 646px; overflow 109.5px.
- Resized to 1280×600: active Card 03 retained; stage 638px; overflow 101.5px.
- Resized back to 1920×900: active Card 03 retained; stage returned to 836.5px.
- Reverse scroll returned to Card 01; forward scroll returned to Card 03 through the original rounded progress mapping.
- Console errors/warnings: 0.

## Corrected short-screen behavior

An initial experiment moved the whole sticky stage upward by the overflow amount. That clipped the left title and top collapsed rows, so it was rejected. The final implementation keeps the stage top at the measured Header bottom, lets the stage extend naturally below the viewport, and compensates only the left auxiliary list so Operations / Security / Observability remains near the visible bottom. Card content is neither compressed nor internally scrolled.
