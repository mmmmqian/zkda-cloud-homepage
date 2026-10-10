# Header Dropdown Theme + Visual Geometry V93 Runtime QA

## Scope

- Dropdown / Mega Menu only. Primary navigation markup, pill hover, routes, Header height and section-theme state owner are unchanged.
- V4 introduced grouped icon/title/description items, Header-theme inheritance and hover/focus arrows.
- V4.1 calibrated the Header seam, square panel geometry and neutral dark palette.

## Root causes

1. The panel used `top: calc(100% - 0.42rem)`, placing its top about 6.7px inside the 62px navigation row.
2. Panel, item and icon radii were `16px`, `12px` and `11px`, which conflicted with the site's geometric UI language.
3. Dark Dropdown tokens reused Header green-black values (`#020801`, `#142018`) and translucent white hover, producing a visible green cast.
4. `css/content.css` previously hard-coded a light Dropdown surface after `site.css`; it now consumes the same Header-owned tokens.

## Final geometry and tokens

- Panel anchor: `top: 100%` on the full-height `.nav-group` (`62px`), sharing the Header's 1px divider seam.
- Runtime: Header rect bottom `63px`; panel top `62px`; the `-1px` relation is the shared border pixel, not content overlap or a gap.
- Panel radius: `0px`; item radius: `4px`; icon radius: `4px`; shadow: `none`.
- Dark palette: background `#0B0C0F`; icon `#191B20`; hover `#22252B`; border `#2B2E34`; text `#F5F6F8`; muted `#ACB1BA`; label `#8B929C`.

## Runtime results

| Viewport | Panel width | Panel height | Horizontal overflow | Header/panel seam |
| --- | ---: | ---: | ---: | ---: |
| 1600×900 | 416px | 288.2px | 0px | shared 1px divider |
| 1280×800 | 416px | 288.2px | 0px | shared 1px divider |
| 1024×768 | 416px | 288.2px | 0px | shared 1px divider |

- Light theme: panel `rgba(255,255,255,.96)`, border `rgba(2,8,1,.12)`, no shadow.
- Dark theme: all seven neutral tokens matched their exact computed colors; no green gradient or shadow remained.
- Hover/focus sample: item height remained `72px`; arrow opacity moved to `1`; title color did not change; dark hover was `rgb(34,37,43)`.
- Keyboard Escape closed the menu, set `aria-expanded=false`, and returned focus to the Product summary.
- Mobile 768px and 390px retained the existing click-to-expand flow, full-width panel and zero horizontal overflow.
- Browser console: 0 errors and 0 warnings.
