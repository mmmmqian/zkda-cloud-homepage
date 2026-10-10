# Solutions Continuous Scroll Motion — Design QA

## Source and scope

- Motion reference: `/Users/mmmmqian/Desktop/录屏2026-09-22 11.00.36.mov` and its keyframe analysis in `outputs/solutions-motion-analysis/`.
- Static stack reference: user-provided Transform9 screenshot.
- Runtime: `http://127.0.0.1:8000/?solutionsmobile=20260923v18#solutions`, loading `content.css?v=20260923-solutions-mobile-v18` and `site.js?v=20260923-solutions-mobile-v18`.
- Scope: Desktop, tablet and phone share one continuous native sticky stage. Only `prefers-reduced-motion` intentionally falls back to static reading flow.

## Root cause and replacement

The v10 stage used `floor(progress / cardHeight)` to toggle `.is-current` and hid every non-current content surface. That produced discrete state swaps: a card could only be fully current or fully absent, so the incoming panel’s physical travel was not rendered.

The replacement keeps one native CSS sticky stage, fixed z-order (`01/02/03 = 1/2/3`), and all three card layers for the whole timeline. Each `.solution-card__content` now separates the surface from a `.solution-card__content-layer` containing its number, copy, tags and Figma visual. A passive scroll listener only schedules `requestAnimationFrame`; the frame render uses cached measurements and writes CSS variables (`--solution-y`, `--solution-inset`, `--solution-surface`, `--solution-content-opacity`, `--solution-content-scale`). It does not read layout during scrolling, write scroll position, snap, or toggle visibility/display during motion.

## Mobile extension — v18

The earlier mobile result was not a weakened version of the stage: it was a different normal-flow implementation. JavaScript prevented initialization below `992px`, while the `768–991px`, `480–767px`, and `<=479px` CSS blocks independently reset the stage and cards to `position: relative`. Both guards have now been removed.

At phone sizes, the same controller first measures every naturally laid-out card and sets the shared `--solution-card-height` to the tallest value. It then calculates `--solution-current-top` from the card bottom and available viewport: short cards pin beneath the header; cards taller than the available viewport use a negative sticky offset, allowing their full natural content to scroll into view before takeover. There is no mobile-only active index, scroll interception, snapping, or threshold controller.

Mobile parameters are deliberately reduced while retaining the desktop choreography: `12–14px` x/y depth steps, `285–320px` takeovers, `108–128px` future-card depth, and a `26–30svh` final hold. The shared outgoing-content curve remains `1 → .965 → .93` and `1 → .52 → .28`; the current foreground card stays at `scale(1) / opacity(1)`.

## v18 validation status

- Static checks: `node --check js/site.js` and source-to-`dist` synchronization passed.
- Runtime screenshot capture remains pending in this execution environment: the existing local browser session is not controllable by the current tool binding, and the shell network namespace cannot reach its `127.0.0.1:8000` server. Do not treat the v17 screenshots below as evidence for the new mobile behavior.
- Required next runtime matrix: 430/390/375 phone widths and 820/768 tablet widths, with one 390px 01→02 midpoint, one final 03 hold, native reverse scroll, and a reduced-motion static-flow check.

## Motion contract

- Entry reading hold: `170px`.
- Each continuous takeover: `460px`.
- Inter-card reading hold: `170px`.
- Final hold: `clamp(320px, 52svh, 580px)`.
- Card 02 starts one card-height below the stage; Card 03 starts a further `260px` below so it cannot appear during 01 → 02.
- The outgoing card itself continuously moves to `28px / 24px` near or `56px / 48px` rear geometry. Its own dark surface eases toward `#BDBDC3` then `#E0E0E2`; the complete content layer scales and fades with the same scroll progress. No substitute backplate is rendered.
- Current card: `scale(1) / opacity 1`. Previous-1: `scale(.965) / opacity .52`. Previous-2: `scale(.93) / opacity .28`. This applies equally to number, title, body, tags and image.
- Track height explicitly includes the stage height plus all motion distances, so release follows the final hold without a jump.

## Runtime proof — 1051 × 798 browser

| Check | Observed result |
|---|---|
| 01 → 02 halfway | Card 01 `y=-11.99px`, inset `13.99px`, surface `rgb(49 53 49)`, complete content-layer `scale(.9825) / opacity .76`; Card 02 remains `scale(1) / opacity 1`, at `y=290.65px`; Card 03 remains `y=841px` outside the stage. |
| 02 → 03 halfway | The same continuous retreat curve is applied to Card 02 while Card 03 rises from below; no discrete active-class swap occurs. |
| Final hold | 01=`-47.99px/55.99px`, `scale(.93) / opacity .28`; 02=`-23.99px/27.99px`, `scale(.965) / opacity .52`; 03=`0.21px/0px`, `scale(1) / opacity 1`; stage remains at `114px`. |
| Release | At track bottom `661.1px`, the stage has moved from `114px` to `80.1px`—native sticky release is in progress. |
| Reverse | Scrolling back to the same 02 → 03 midpoint restores precisely `-35.94px`, `-11.94px`, `422.6px`. |
| Console | No warning/error is attributed to `solutions-depth-v17`. |

## Evidence

- Midpoint and final-stack screenshots: `docs/evidence/solutions-full-card-depth-20260923/transition-a-half-v17.png` and `final-stack-v17.png`.
- Earlier release and real browser handoff evidence remains in `docs/evidence/solutions-self-retreat-motion-20260922/`.

final result: passed
