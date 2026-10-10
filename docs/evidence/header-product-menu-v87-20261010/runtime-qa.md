# Header Product Menu V87 — Runtime QA

Date: 2026-10-10

## Scope

- Removed the complete `PRODUCT PREVIEW` / 导览 column from the Product dropdown.
- Kept only `平台产品 / PRODUCTS` and the three existing product routes.
- Added semantic Product current state on the three product detail pages.
- Reused the global underline motion tokens and the existing native `details` keyboard behavior.

## Runtime evidence

Desktop viewport checks at 1600×800, 1280×800 and 1024×800:

- Header height: `63px` at all three widths.
- Product panel width: `352px` at all three widths.
- Product panel columns: one `332.406px` content column inside the existing panel padding.
- Product preview / aside nodes: `0`.
- Product entries: `3`.
- Horizontal overflow: `0px`.

Open state:

- Product label: `rgb(27, 27, 26)`.
- Underline: `currentColor`, computed `rgb(27, 27, 26)`.
- Chevron after its 160ms transition: `matrix(-1, 0, 0, -1, 0, 0)` (180°).
- Default item surface: `rgb(255, 255, 255)`.
- Item title: `rgb(27, 27, 26)`.
- Item description: `rgb(98, 98, 94)`.

Token Hub current-page check:

- Product group has `.nav-group--current`.
- Product underline is fully visible (`scaleX(1)`) and black.
- `Token Hub` is the only `aria-current="page"` item.
- Current-item top-right marker content is `↗`.

Keyboard:

- `Enter` opens the native Product `details`.
- `Escape` closes it.
- Open chevron settles at 180°; closed chevron returns to `none`.

Console and build:

- Console errors/warnings: `0`.
- `css/site.css` and `js/site.js` match `dist/` after synchronization.
- Source and `dist/` both contain zero copies of the removed preview copy.
