# Final CTA Contact Label Left Alignment V86 — Runtime QA

## Scope

Only the top labels inside the Final CTA contact/register panels were aligned to each panel's left edge. Bottom actions and all panel geometry remain unchanged.

## Implementation

- Owner: `.home-final-cta__panels p`
- Alignment: `align-self: flex-start; text-align: left`
- Shared typography: `18px / 1.4 / 400`
- Wrapping: `white-space: nowrap`
- Left inset: inherited from each panel's existing shared padding (`36px` desktop, `24px` tablet, `20px` mobile)

## Runtime result

At the active responsive runtime width, both labels measured:

- top: `460.1328px`
- bottom: `485.3281px`
- font-size: `18px`
- font-weight: `400`
- line-height: `25.2px`
- left inset within each panel: `24px`
- horizontal overflow: `0px`
- console errors/warnings: `0`

Visual inspection confirms the contact label remains at the black panel's top-left, while the experience label now uses the green panel's top-left. The email remains left-aligned and the large register link remains right-aligned.

