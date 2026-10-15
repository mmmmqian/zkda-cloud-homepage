# Footer Account Actions V96 — Runtime QA

Date: 2026-10-12

## Root cause

- `.home-footer__directory section` made every directory child a grid container, while the account-specific rule only changed `gap`; the two actions therefore did not have an explicit horizontal layout owner.
- The Footer login link did not carry the same `.u-underline-hover` semantic class as Immediate Experience, so the two peer actions had inconsistent hover feedback.
- The account Grid Item stretched vertically until `align-self: start` was declared, which prevented its links from sharing the heading row top.

## Implementation

- `.home-footer__directory .home-footer__account` is the single layout owner: horizontal Flex, centered items, right justification, `32px` gap, no wrapping.
- The account item is aligned to the start of the directory Grid row.
- Login and Immediate Experience both use `.u-underline-hover`.
- Footer email, responsive brand logo, Legal and Curtain Lift remain unchanged.

## Responsive measurements

| Viewport | Account display | Gap | Link top/bottom match | Heading top match | Right edge | Horizontal overflow |
| --- | --- | ---: | --- | --- | --- | ---: |
| 1024 × 900 | flex / row | 32px | exact | exact | 988px | 0px |
| 1280 × 900 | flex / row | 32px | exact | exact | 1244px | 0px |
| 1600 × 900 | flex / row | 32px | exact | exact | 1564px | 0px |
| 1920 × 900 | flex / row | 32px | exact | exact | 1884px | 0px |

Both links measured `22.4px` high at every tested width and remained on one line.

## Underline motion

- Default: `scaleX(0)`; no underline is visible.
- Hover / focus: `scaleX(0) → scaleX(1)` from the left origin.
- Leave: the line returns to the default hidden state.
- Login and Immediate Experience share the same `.u-underline-hover` rule and ordinary-link motion token.

## Evidence

- `footer-account-1024.jpg`
- `footer-account-1280.jpg`
- `footer-account-1600.jpg`
- `footer-account-1920.jpg`
