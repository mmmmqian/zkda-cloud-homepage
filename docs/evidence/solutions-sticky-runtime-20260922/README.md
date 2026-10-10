# Solutions Sticky Runtime Proof — 2026-09-22

## Runtime target

- Browser: Chromium, `1651 × 1000` desktop viewport.
- Served URL: `http://127.0.0.1:8000/?stickyproof=20260922v3#solutions`.
- Loaded stylesheet: `http://127.0.0.1:8000/css/content.css?v=20260922-solutions-sticky-proof-v3`.
- Source-to-dist synchronization: `./scripts/sync-dist.sh` completed before this check.

## Root cause

The prior live document retained the old document/CSS URL `content.css?v=20260922-solutions-stack-v1`, whose desktop card margins resolved to `720px` at this viewport. That ordinary-flow runway created the visible blank region between cards and prevented the intended takeover from appearing during the user’s screenshot state.

The sticky declaration itself was not overridden: runtime computed styles already reported `position: sticky`. The repair removes the visible desktop/tablet inter-card runway (`margin-bottom: 0`), makes `.solution-stack` an explicit relative shared container, retains release distance as stack padding, and advances the stylesheet query to `solutions-sticky-proof-v3`. A fresh document load on port 8000 confirms that exact version is served.

`main#main` computes to `overflow: clip`; it was audited as a potential ancestor hazard, but it does not prevent the measured Chrome sticky behavior in this document. No ancestor transform, filter, perspective, containment, or competing scrolling box is present between card and viewport.

## Runtime facts

Simplified DOM:

```text
section#solutions.home-solutions
  div.solution-stack (position: relative; height: 2263px)
    article.solution-card[data-index="0"]
    article.solution-card[data-index="1"]
    article.solution-card[data-index="2"]
```

- Actual fixed header height: `63–63.5px`; Solutions uses the matching 64px layout token.
- Card 01/02/03 computed sticky tops: `88px` / `101px` / `114px`.
- Computed z-index: `1` / `2` / `3`.
- Card height: `581px`; stack height: `2263px`; available parent travel: `1682px`.
- Card transforms: `none`; card overflow: `hidden` only for its own visual crop.

## Captured states

| State | Runtime geometry | Evidence |
| --- | --- | --- |
| A — 01 current | 01: `top 88`; 02: `top 669`; 03: `top 1250` | [State A](./state-a-card-01-current.png) |
| B — 02 entering | 01: `top 88`; 02: `top 400`; 03: `top 981` | [State B](./state-b-card-02-entering.png) |
| C — 02 current | 01: `top 88`; 02: `top 101`; 03: `top 682` | [State C](./state-c-card-02-current.png) |
| D — 03 entering | 01: `top 88`; 02: `top 101`; 03: `top 400` | [State D](./state-d-card-03-entering.png) |
| E — 03 current | 01: `top 88`; 02: `top 101`; 03: `top 114` | [State E](./state-e-card-03-current.png) |

States C and E show the required 13px / 13px previous-card edges. No transform, opacity, scale, scroll listener, or scroll-jacking is used.
