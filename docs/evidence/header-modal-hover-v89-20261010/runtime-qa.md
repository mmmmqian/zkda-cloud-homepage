# Header Modal Hover V89 — Runtime QA

Date: 2026-10-10

## Scope

- Removed every first-level dropdown chevron and its layout width.
- Replaced Header underlines with stable light-gray pill feedback.
- Kept the V87 Product menu as a three-entry, single-column panel.
- Preserved Header height, routes, Logo, account actions and the blue primary CTA.

## Motion and state

- Pill surface: `#F3F4F5`, `border-radius: 999px`, `180ms` background transition.
- Panel enter: `200ms`, opacity `0 → 1`, `translateY(6px) → 0`.
- Pointer leave: `180ms` delayed close; re-entering the owning `details` cancels close.
- Desktop: pointer enter/focus opens; moving to another dropdown switches state; entering a plain link closes.
- Mobile: native click-to-toggle remains active.
- Keyboard: focus opens, Escape closes and returns focus, `aria-expanded` follows native `open`.
- Reduced motion disables the new transitions without changing the final state.

## Responsive geometry

| Viewport | Header | Text control | Center spread | Chevron | Underline pseudo | Horizontal overflow |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1600×800 | 63px | 40px | 0px | 0 | 0 | 0px |
| 1280×800 | 63px | 40px | 0px | 0 | 0 | 0px |
| 1024×800 | 63px | 40px | 0px | 0 | 0 | 0px |

No first-level label wrapped at these widths.

## Interaction checks

- Product open: `open=true`, `aria-expanded=true`, pill `rgb(243,244,245)`, three product links.
- Product → Solutions: Product closed and Solutions opened with matching ARIA state.
- Product → Pricing: all dropdowns closed; Pricing retained pill-only feedback and no underline pseudo.
- Dropdown panel hit testing resolved to its own Product link content, confirming it sits above the Hero and remains interactive.
- Escape: menu closed, `aria-expanded=false`, focus returned to Product.
- 768×900 mobile: full menu and Product details opened by click; three product entries, no chevron, no horizontal overflow.
- Final browser console: 0 errors, 0 warnings.

## Distribution

- All 16 source pages reference `site.css` and `site.js` cache key `20261010-modal-hover-v89`.
- All 16 dist pages use the same cache key.
- Source and dist CSS/JS are byte-identical after `scripts/sync-dist.sh`.
