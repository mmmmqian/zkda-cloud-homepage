# Final CTA Contact Label Alignment V85 — Runtime QA

## Scope

Only the top labels inside the Final CTA contact/register panels were aligned. Email, large register link, panel geometry, surfaces, dividers, and interaction remain unchanged.

## Implementation

- Owner: `.home-final-cta__panels p`
- Alignment: `align-self: flex-end; text-align: right`
- Shared typography: `18px / 1.4 / 400`
- Wrapping: `white-space: nowrap`
- Right inset: inherited from each panel's existing shared padding (`36px` desktop, `24px` tablet, `20px` mobile)

## Runtime result

At the current responsive runtime width, both labels measured:

- top: `1276.6328px`
- bottom: `1301.8281px`
- font-size: `18px`
- font-weight: `400`
- line-height: `25.2px`
- right inset within each panel: `24px`
- horizontal overflow: `0px`

Visual inspection confirms the left label is right-aligned to the black panel boundary while the right label remains right-aligned to the green panel boundary. Console: 0 errors/warnings.

