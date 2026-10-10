# Current vs Reference Motion Gap

| Dimension | Current implementation | Reference recording | Required correction |
| --- | --- | --- | --- |
| Interaction model | Index-specific sticky tops plus fixed 330px margins | Scroll-linked stack with old panels clipped to thin edges | Rebuild around a current-card threshold and clipping, not per-card guessed sticky offsets. |
| Start / runway | Figma layout gap treated as motion runway | Card takeover occurs after readable viewport travel | Derive runway from panel/viewport cadence, not 330px. |
| Previous cards | Can release from the stack before the current card is established | Stay as opaque 12–14px physical edges | Keep prior cards in the stack layer and clip their bodies. |
| Stack offset | 10px guessed | Approximately 12–14px from video frames | Use the recorded exposed-edge measure. |
| Scale / opacity | No deliberate scale, but layering model does not guarantee reference hierarchy | No scale and no fading | Explicitly lock scale and opacity to 1. |
| Current card | Can move out during an overlong parent travel | Holds full panel while primary | Define a stable current-card viewport threshold. |
| Release | Parent-driven release can occur before the intended final read | Release only after final-card reading interval | Give the final panel its own normal-flow release runway. |
| Reverse | Native sticky is reversible but the wrong travel geometry reverses the wrong state | Continuous reverse of the same stack | Keep all position outcomes dependent on scroll position only. |
| Mobile | Existing fallback is reasonable | Recording is desktop-only | Retain normal flow below 768px; no forced desktop stack. |
