# Header Navigation Vertical Alignment V84 — Runtime QA

- Date: 2026-10-09
- Scope: desktop Header navigation row only
- QA URL: `http://127.0.0.1:8001/?headerqa=vertical-v84`

## Root cause

The Header base rule correctly declared normal navigation anchors and dropdown summaries as `inline-flex`. A later global underline-motion selector also matched `.primary-nav > a` and `.header-account > a:not(.header-cta)`, changing only those anchors to `inline-block`. Their outer boxes remained 62px tall, but their text line boxes moved to the block start, while dropdown summaries stayed flex-centered.

## Fix

- At desktop widths (`min-width: 901px`), all direct navigation anchors, dropdown summaries and account actions share:
  - `display: inline-flex`
  - `align-items: center`
  - `height/min-height: 3.875rem`
  - `padding-block: 0`
  - `line-height: 1`
  - `white-space: nowrap`
- `.nav-group` shares the same 62px row and centers its summary.
- `.nav-chevron` is non-shrinking; the existing 6px gap is unchanged.
- Dropdown panels remain `position: absolute` and do not contribute to Header height.
- No per-item margin, top, translate or transform correction was introduced.

## Runtime results

| Viewport | Header | Text centers | Arrow delta | Horizontal overflow |
| --- | ---: | --- | ---: | ---: |
| 1600×900 | 63px including border | all 8 identical | 0px sampled | 0px |
| 1280×800 | 63px including border | all 8 identical | 0px sampled | 0px |
| 1024×768 | 63px including border | all 8 identical | 0.25px raster difference | 0px |

At 1024px, keyboard-opening the Product dropdown kept Header height at 63px and all eight text centers at 30.75px. The dropdown panel computed `position:absolute`, so open/close did not move any navigation label.

## Preserved

- Header height and Logo position
- Horizontal navigation spacing and breakpoint-specific inline padding
- Colors, underline motion and dropdown animation
- Mobile menu rules at `max-width: 900px`
- Navigation DOM and link destinations

