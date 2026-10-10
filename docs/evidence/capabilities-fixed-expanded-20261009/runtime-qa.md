# CAPABILITIES Fixed Expanded Geometry V3 — Runtime QA

Date: 2026-10-09  
URL: `http://127.0.0.1:8001/?capabilitiesqa=fixed-expanded-v77#capabilities`

## Geometry contract

```text
collapsedStackHeight = (cardCount - 1) * collapsedHeight
expandedHeight = stageHeight - collapsedStackHeight
activeTop = activeCardIndex * collapsedHeight
bottomRemaining = stageHeight - activeTop - expandedHeight
```

For six cards and a 76px collapsed row:

```text
collapsedStackHeight = 5 * 76px = 380px
expandedHeight = stageHeight - 380px
```

## 1920×900 stable states

Measured Header border box: 63.5px. Stage height: 836.5px. Shared expanded height: 456.5px.

| Active card | Top | Height | Bottom | Bottom remaining |
| --- | ---: | ---: | ---: | ---: |
| 01 | 0px | 456.5px | 456.5px | 380px |
| 02 | 76px | 456.5px | 532.5px | 304px |
| 03 | 152px | 456.5px | 608.5px | 228px |
| 04 | 228px | 456.5px | 684.5px | 152px |
| 05 | 304px | 456.5px | 760.5px | 76px |
| 06 | 380px | 456.5px | 836.5px | 0px |

Card 02 and Card 06 were captured as real runtime screenshots during QA. Card 02 retains the intended light area below the expanded panel; Card 06 meets the Stage bottom.

## Minimum height

At 1920px width every card requires the same 266px minimum expanded content height:

```text
expanded header = 84px
max(copy, visual) = 146px
body bottom padding = 36px
minimumExpandedHeight = 266px
minimumStageHeight = 5 * 76px + 266px = 646px
```

## Resize QA

Card 02 remained active through:

| Viewport | Stage | Expanded | Top | Bottom remaining | Minimum stage |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1280×800 | 736.5px | 356.5px | 76px | 304px | 638px |
| 1280×600 | 638px | 258px | 76px | 304px | 638px |
| 1920×900 | 836.5px | 456.5px | 76px | 304px | 646px |

- Short-height mode keeps the existing normal-page overflow behavior and has no card-internal scrollbar.
- Forward scroll reached Card 05 from Card 02; reverse scroll returned to Card 02.
- Console errors/warnings: 0.
