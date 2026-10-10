# CAPABILITIES Progress Mapping V79 — Runtime QA

Date: 2026-10-09

## Diagnosis

The five mathematical segments were already equal. At 1600×900 every takeover owned 878.325px and Card 04 / 05 both kept the shared 456.5px expanded height. No special nth-child state, duplicate interval, index offset, or progress discontinuity existed.

The defect was two competing clocks:

- `activeCardIndex = round(totalProgress × 5)` followed scroll immediately.
- Card `top` followed a separate 620ms CSS transition.

During a fast continuous input, Card 04 could become active and Card 05 could reach the next threshold before Card 04 finished travelling from the stage bottom.

## Before / after fast sample

| Sample | Before V78 | After V79 |
| --- | --- | --- |
| 70ms | Card 04 active, top 668.8px; Card 05 future | Card 04 active and settled at 291.5px; Card 05 future |
| 140ms | Card 05 active; Card 04 top 471.6px; Card 05 top 672.9px | Card 05 active and settled at 367.6px; Card 04 stable at 291.5px |
| 630ms | Card 05 finally settled | State already stable; no trailing positional animation |

## Mapping

The existing global geometry remains unchanged:

```text
scrollStep = 1.05 × stageHeight
scrollRange = 5 × scrollStep
active threshold = 50% of each segment
```

For every incoming card, segment 0–50% holds the current card. Segment 50–100% maps the next card from the stage bottom to its fixed collapsed-stack top with a reversible smoothstep. Card height never changes.

## 1600×900 keyframes

| Keyframe | Virtual index | Active | Card 04 top | Card 05 top |
| --- | ---: | ---: | ---: | ---: |
| 03→04 25% | 2.273 | 03 | 900px | 900px |
| 03→04 50% | 2.501 | 04 | 900px | 900px |
| 03→04 75% | 2.774 | 04 | 551.8px | 900px |
| 03→04 100% | 3.002 | 04 | 291.5px | 900px |
| 04→05 25% | 3.275 | 04 | 291.5px | 900px |
| 04→05 50% | 3.503 | 05 | 291.5px | 899.9px |
| 04→05 75% | 3.776 | 05 | 291.5px | 592.3px |
| 04→05 100% | 4.004 | 05 | 291.5px | 367.5px |

Card 04 and Card 05 remained 456.5px tall throughout.

## Reverse and responsive checks

- Reverse 06→05→04→03 produced active 06 / 05 / 04 / 03 at virtual indices 4.999 / 3.997 / 2.996 / 1.994.
- 1280×800: Card 03 → 04 reached virtual 3.008 with Card 04 settled at 291.5px; reverse returned Card 03 and Card 04 to 800px.
- 1024×768: Card 03 → 04 reached virtual 3.010 with Card 04 settled at 291px; reverse returned Card 03 and Card 04 to 768px.
- Both responsive viewports had zero horizontal overflow.
- Browser console: zero errors and zero warnings.

## Physical input note

The automated environment can exercise native browser scrolling, PageDown/PageUp, rapid key bursts, and inertial smooth-scroll tails, but cannot generate a literal human Mac trackpad gesture. A high-speed physical gesture can still cross more than one real scroll step by design; V79 guarantees that rendering follows the resulting progress without a trailing 620ms animation clock or 04/05 state overlap.
