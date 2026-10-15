# Footer Brand Logo Responsive V95 — Runtime QA

日期：2026-10-12

## 根因

- `.home-footer__brand-backdrop img` 使用 `max-width: 1579px`，使 Logo 在可用宽度超过 SVG 原始像素宽度后停止放大。
- `.home-footer` 的 `--footer-brand-height` 使用 `clamp(..., 433px)`，品牌画布也在 433px 封顶；若只解除图片宽度上限，1920px 以上 Logo 会超出画布并与 Legal 区域冲突。
- `assets/brand/logo-lockup-white.svg` 的 `viewBox="0 0 1579 360"` 与图形边界一致，没有需要裁除的透明画布留白。

## 实现

- Logo：`width: 100%; max-width: none; height: auto; object-fit: contain`。
- Desktop 品牌画布：`max(160px, calc(22.7992vw + 55.5845px))`。
- Tablet 品牌画布：`max(160px, calc(22.7992vw + 37.056px))`。
- Mobile 品牌画布：`max(160px, calc(22.7992vw + 30.88px))`。
- 公式等价于：`(viewport width - 2 × gutter) × 360 / 1579 + 2 × gutter`。因此画布、可用宽度和 SVG 比例共享同一几何来源。
- Curtain Lift 的 sticky owner、grid rows、层级、滚动方向、Legal normal-flow 位置均未修改。

## 宽屏几何

| Viewport | Canvas height | Logo width × height | Logo ratio | Horizontal overflow |
| --- | ---: | ---: | ---: | ---: |
| 1280×1000 | 347.41px | 1208 × 275.41px | 4.3861 | 0px |
| 1600×1000 | 420.37px | 1528 × 348.37px | 4.3862 | 0px |
| 1920×1000 | 493.33px | 1848 × 421.33px | 4.3861 | 0px |
| 2560×1000 | 639.24px | 2488 × 567.24px | 4.3861 | 0px |

SVG 原始比例 `1579 / 360 = 4.3861`，四档运行时均保持一致。

## Curtain Lift

- 1600×900 完整揭示：Logo `1528 × 348.37px`，Legal 紧接品牌画布之后，无重叠。
- PageUp 反向进入中间态时，Logo 宽高保持 `1528 × 348.37px`，仅品牌画布与 Curtain 的视口位置变化。
- 再次滚动到底部后恢复完整揭示，scroll position 回到 max scroll，Logo 几何不变。
- `prefers-reduced-motion` 仍沿用原有 normal-flow Curtain → Brand 顺序。

## 证据

- `footer-1280-full.png`
- `footer-1600-full.png`
- `footer-1600x900-full.png`
- `footer-1600-reverse-mid.png`
- `footer-1920-full.png`
- `footer-2560-full.png`
