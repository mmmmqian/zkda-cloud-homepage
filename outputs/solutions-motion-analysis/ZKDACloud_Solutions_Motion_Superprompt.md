# ZKDACloud Solutions Motion Superprompt

## Evidence and scope

- Motion reference: `/Users/mmmmqian/Desktop/录屏2026-09-22 11.00.36.mov`.
- Visual reference: Figma `6W3cSUHu3kZvwWmT9kYbmC`, node `259:182`.
- Frame evidence: `outputs/solutions-motion-analysis/frames/t01.mov.png` through `t08.mov.png`.
- Scope: homepage Solutions motion only. Preserve the Figma card geometry, dark panel treatment, Typography, imagery, dividers and shared `.section-label`.

## Interaction model

Use a **scroll-linked stacked-panel sequence**. It is best modelled as native sticky cards in normal document flow, with a single fixed current-card threshold and a controlled previous-card top-edge reveal. It is not a carousel, click sequence, opacity stack, scroll snap, or a one-shot entrance animation.

Why: the next card enters from below under ordinary scrolling; each takeover is reversible; old cards stay opaque and readable only as a narrow top edge; and the current card does not animate independently from scroll position.

## Timeline from the reference recording

| Time | State | Observed motion |
| --- | --- | --- |
| 1s | A — section entry | Header remains in normal flow; Card 01 has not yet become the focal panel. |
| 2s | B — Card 01 entry | Card 01 rises from below the viewport; its full panel is still entering. |
| 3s | C — Card 01 current / Card 02 approach | Card 01 is the full main panel. Card 02 enters from the lower edge; no opacity or scale change is visible. |
| 4s | D — Card 02 takeover | Card 02 becomes the current full panel. Card 01 is compressed to a thin opaque top edge immediately below the fixed navigation. |
| 5–6s | E — Card 03 takeover | Card 03 becomes current. Cards 01 and 02 persist as two thin, stepped, opaque edges above it. |
| 7s | F — transition onward | Card 04 begins below; prior stack remains a compact physical layer stack. |
| 8s | G — stable stacked state | Current card remains full height; three previous edges are about equally spaced and non-fading. |

## Card motion rules

- **Current card:** full panel height; opaque; no visible scale; no independent easing; its entry is directly coupled to scroll.
- **Next card:** begins below the viewport/current panel boundary and moves upward with normal document scrolling. It covers the old card only when it reaches the current-card threshold.
- **Previous card:** remains opaque and at original scale. It is not faded or resized. On takeover it is clipped by the succeeding panel so only an approximately `12–14px` top edge remains.
- **Stack:** each additional previous edge is separated by approximately `12–14px`. The visible stack is physical layering via clipping and z-order, never opacity.
- **Scale:** `NO SCALE` observed. Keep `scale(1)` throughout.
- **Opacity:** `NO OPACITY TRANSITION` observed. Keep `opacity: 1`.
- **Y movement:** normal scroll travel into the threshold; previous cards may continue upward only to their exposed-edge resting positions. No bounce, spring or overshoot.
- **Easing:** effectively linear scroll-linked movement; no time-based easing layer.

## Scroll runway and release

- Each takeover uses roughly one viewport of normal scroll travel: a current panel is readable before the next card becomes primary.
- The Figma 330px inter-card spacing is layout information, not the motion contract. Use a card spacer/runway sized from the active card and viewport so entering panels have visible travel, rather than a fixed guessed gap.
- Header never sticks. Stacking starts only once Card 01 reaches the fixed-header clearance.
- After the final card's readable interval, the stack releases with its containing section and the next homepage section enters normally.
- Reverse scroll must restore each preceding panel continuously; no stateful enter/leave animation is permitted.

## Responsive and reduced motion

- `>=992px`: preserve the complete sticky stack and thin-edge hierarchy.
- `768–991px`: retain the stack but shorten travel/runway and edge exposure proportionally; preserve readable columns.
- `<768px`: reduce to document flow if viewport height makes the stack dominate reading.
- `prefers-reduced-motion: reduce`: normal document flow; all solution content remains visible and in original order.

## Implementation constraints

- Prefer CSS sticky plus normal flow spacers and CSS clipping.
- Do not intercept wheel events, use scroll snap, autoplay, time-driven transforms, scale, blur, glow, or opacity fades.
- Do not attach a per-frame scroll handler. If script is needed, it may only supply a non-animated capability/reduced-motion fallback.
