# ZKDACloud Homepage Responsive System — V4

## Intent

The homepage uses one predictable responsive cascade rather than breakpoint patches. The current design principle, refined from the Transform9 breakpoint study, is:

> Scale → Wrap → Compress → Preserve → Reorient → Recompose

And the main preservation rule is:

> Preserve composition grammar for as long as it remains usable.

Large screens expand the visual stage without drifting the editorial anchor; desktop scales fluidly; compact desktop preserves the composition while reducing secondary geometry; tablet preserves section grammar and only overrides what no longer fits; Mobile Landscape selectively reflows; Mobile Portrait may fully recompose.

The homepage design baseline remains around `1600px`. The homepage Hero has a more precise static source of truth: Figma file `6W3cSUHu3kZvwWmT9kYbmC`, node `64:34956`, reference stage `1651 × 863`.

## Global range contract

| Range | Mode | Primary behavior |
| --- | --- | --- |
| ≥2560 | Ultra Wide | Expand Stage; cap UI/read widths |
| 1920–2559 | Large Desktop | Expand Space; preserve anchor and visual ratio |
| 1600–1919 | Wide Desktop / Baseline | Full composition |
| 1280–1599 | Standard Desktop | Fluid scale + compress |
| 992–1279 | Compact Desktop | Preserve composition; simplify secondary geometry |
| 768–991 | Tablet | Preserve Grammar + Compress + Selective Override |
| 480–767 | Mobile Landscape | Selective Reflow / Reorient |
| ≤479 | Mobile Portrait | Recompose |

Global ranges describe page behavior; they are not a requirement for every component to switch at the same number. Component-specific capacity or interaction evidence can define an exception.

## Hero contract

### Source of truth

- Figma node: `64:34956`
- Reference stage: `1651 × 863`
- Reference title: `100px / 122px`, regular weight
- Reference left anchor: `36px`
- Reference title top: `78px`
- Reference lower grid: starts around `y=507`, height `356px`, desktop split `50 / 50`
- Reference lower-grid copy: “我们是谁：” + approved paragraph; “联系我们：” + `contact@zhongkedayun.com`

Figma defines the composition. The responsive system defines how that composition adapts.

### Desktop + Compact Desktop

At `≥992px`, Hero geometry uses one continuous Figma-derived scale model. It must not switch between `100svh` and width-derived geometry at a breakpoint. The title, lower grid, anchor, typography, and pixel field scale as one composition.

Large-screen growth follows:

> Expand Stage + Preserve Anchor + Preserve Hero Ratio

Additional viewport width primarily enters title scale/stage, right-side pixel field, background field, System Spine, and motion travel space—not symmetric outer margins.

### Tablet — 768–991

Tablet **preserves the Hero Lower Grid 50 / 50 grammar**. This is a confirmed project decision.

- Keep the full-width stage and full-bleed divider.
- Keep the center vertical divider.
- Keep `Who / Contact` side by side.
- Compress typography and padding to maintain readable columns.
- Do not preserve desktop sizes blindly: the long email is reduced to a tablet-safe display size.
- The Hero title may wrap through the approved semantic break, but does not collapse into a generic mobile layout.

### Mobile Landscape — 480–767

This Hero selectively reflows to one lower column because the approved Chinese paragraph plus the long contact email no longer sustain a useful 50 / 50 split. The stage-level divider remains full bleed; the desktop vertical divider is replaced by horizontal block separation.

### Mobile Portrait — ≤479

Mobile Portrait is allowed to fully recompose while preserving content hierarchy, Pixel Field language, divider language, and approved semantic title breaks.

## Full-bleed divider contract

The line at the top of the Hero lower-information area is a stage-level structural divider.

- It is full-bleed at every viewport width.
- It is not a border on a centered/max-width content container.
- It does not inherit content padding or gutters.
- `≥768px` Hero Lower Grid shows the center vertical divider while the 50 / 50 grammar is active.
- `<768px` removes the vertical divider and may use horizontal separators between stacked blocks.

A structural divider defined as full-bleed must never alternate between full-width and inset states across breakpoints.

## Component-specific breakpoint exceptions

Global page modes do not require every component to switch behavior at the same number. Existing interaction evidence and content capacity define these explicit exceptions:

- **Navigation:** `≤900px` uses the mobile menu because the full navigation no longer fits reliably.
- **Verified Metrics:** `≤720px` uses the approved vertical click accordion; `≥721px` keeps the horizontal interaction.
- **Product System:** `≤720px` uses the approved mobile stacked composition; `≥721px` keeps the approved two-column grammar. There must be no `901–1023px` single-column reversal.
- **Platform Capabilities:** pinned desktop behavior begins at `≥1024px`. Below that the section may reorient into document flow because the desktop two-column grammar depends on pinned choreography; this is an intentional structural exception to the global Tablet preservation rule.

These are component contracts, not alternate definitions of the global Mobile breakpoint.

## Non-monotonic behavior is prohibited

A component must not change from two-column → one-column → two-column as the viewport narrows unless an explicit, documented interaction reason requires it. Breakpoint behavior should be monotonic and predictable.

For the current Product System, the canonical layout contract is:

`≥721 two-column → ≤720 mobile stack`.

## CSS architecture rule

Responsive fixes must be consolidated into the canonical component block. Do not append new “final fix”, “final override”, or duplicate breakpoint layers to the end of `content.css`.

For the homepage Hero, there must be one canonical selector system only. Before adding a new rule, modify or remove the existing canonical rule.

## Motion contract

Platform Capability cards retain the pinned stack from `1024px` upward. Below `1024px` they use document flow; no mouse-follow, heavy pin, scroll hijacking, or large parallax is introduced. Reduced-motion remains a static, fully readable fallback.

The Hero pixel field follows Hero grammar boundaries: its reference cell is about `120px` at `1651px`, grows on larger screens with a cap, uses desktop density from `992px`, tablet density from `768–991px`, and mobile density below `768px`.

## Deployment contract

ChatGPT Sites serves `dist/` (`.openai/hosting.json`). Source QA and deployment QA are only comparable after source assets are synchronized into `dist`.

Use `scripts/sync-dist.sh` after public HTML/CSS/JS/assets changes and before deployment or final browser QA.

## Verification targets

Regression widths:

`390 / 479 / 480 / 600 / 767 / 768 / 820 / 900 / 901 / 991 / 992 / 1023 / 1024 / 1280 / 1651 / 1920 / 2048 / 2560`

At every relevant target verify:

- no horizontal overflow;
- title anchor and intended semantic line break;
- title visual occupancy across desktop sizes;
- full-bleed Hero lower-stage divider;
- Hero Lower Grid stays 50 / 50 at `768–991`;
- Hero Lower Grid stacks below `768`;
- email remains readable and does not overflow;
- `767/768` and `991/992` do not produce accidental geometry jumps;
- Navigation changes only at its own `900/901` capacity threshold;
- Product System stays two-column through `721–1023` and does not reverse at `900/901`;
- Platform Capabilities switches its motion/layout contract at `1023/1024`;
- Pixel Field density remains intentional;
- source and `dist` render the same public files.
