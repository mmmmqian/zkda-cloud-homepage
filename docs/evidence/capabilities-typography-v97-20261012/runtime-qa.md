# CAPABILITIES Typography Responsive Refinement V97

日期：2026-10-12

## 范围

- 仅调整六张 CAPABILITIES 卡片的标题、序号、描述字号与描述文本宽度。
- 右侧既有 `.platform-capabilities__cards` 成为 `inline-size` query container；未在 sticky stage 或单卡上增加 containment。
- 插画资源、尺寸规则、卡片颜色、50/50 结构、Fullscreen Stage、Minimum Height、等高公式、Progress Mapping 与 `scrollStep = 1.05 × stageHeight` 均未改。

## 响应式规则

- 标题：`clamp(28px, min(4cqi, 5.5svh), 48px)`，`line-height: 1.08`。
- 描述：`clamp(15px, min(2cqi, 3svh), 24px)`，`line-height: 1.5`。
- 序号：`clamp(15px, min(1.8cqi, 2.4svh), 20px)`。
- 描述宽度：卡片内容区 `58%`，最大 `44rem`；移动端恢复原 grid item 宽度。

## 运行态结果

| Viewport | Title | Description | Index | Stage | Card height | Step | Min text→image gap | Forward | Reverse |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 1280×800 | 28px | 15px / 22.5px | 15px | 737px | 357px | 773.85px | 53.77px | 01→06 | 06→01 |
| 1600×900 | 32px | 16px / 24px | 15px | 837px | 457px | 878.85px | 73.77px | 01→06 | 06→01 |
| 1920×1080 | 38.4px | 19.2px / 28.8px | 17.28px | 1017px | 637px | 1067.85px | 140.96px | 01→06 | 06→01 |
| 2560×1440 | 48px | 24px / 36px | 20px | 1377px | 997px | 1445.85px | 275.37px | 01→06 | 06→01 |
| 2560×900 | 48px | 24px / 36px | 20px | 837px | 457px | 878.85px | 275.37px | 01→06 | 06→01 |

说明：Description 一列为字号 / 实际行高。

## Gates

- 六卡字号规则一致：通过。
- 大屏字号随右侧卡片容器宽度增长，并由 `svh` 限制低高度视口：通过。
- 六卡标题均为单行；描述为 1–2 行，原文与换行语义未改：通过。
- 每个 viewport 的 36 个卡片/状态组合中，描述与插画均位于卡片边界内；描述与插画无重叠：通过。
- 所有正文 computed `visibility: visible; opacity: 1`：通过。
- 六张卡在每个 viewport 中保持完全等高：通过。
- `scrollStep / stageHeight = 1.05`，正向 Active 顺序 `01→06`，反向 `06→01`：通过。
- 页面 `scrollWidth === clientWidth`：通过。
- Console error / warning：0 / 0。
- `css/content.css` 与 `dist/css/content.css`、`index.html` 与 `dist/index.html` 字节同步：通过。

## 关键截图

- `capabilities-1600x900-card05.jpg`
- `capabilities-1920x1080-card05.jpg`
- `capabilities-2560x900-card05.jpg`

