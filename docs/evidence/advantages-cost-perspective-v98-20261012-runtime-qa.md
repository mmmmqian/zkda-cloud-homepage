# ADVANTAGES「技术降本」插画透视修正 V98

日期：2026-10-12

## 诊断

- 中心蓝色立方体、上方三个小立方体、浅灰辅助网格与三层平台顶面的斜轴均为 `rise/run = 0.54`。
- 漂移来自三层平台的厚度底边：原前角压缩后斜率约为 `0.43`，没有与各自顶面保持平行。

## 修改

仅修改 `03_cost_optimization.svg` 的三条平台厚度轮廓：

- 下层前角：`544 → 557.3`
- 中层前角：`522 → 535.3`
- 上层前角：`500 → 513.3`

每层底面现在都是顶面向下 `17px` 的平行偏移；左右斜边与中心立方体、上方小立方体、辅助网格统一为同一 `0.54` 轴测斜率。

## 保留项

- SVG `441×818` 画布、`viewBox="0 0 441 818"`、所有元素数量与整体留白不变。
- 中心蓝色立方体、三个上方节点、连接线、中轴线、蓝色箭头及浅灰网格坐标不变。
- 线宽、颜色、透明度、动画时序和 reduced-motion 规则不变。
- ADVANTAGES 容器尺寸、`contain` 缩放、Shadow DOM 安全渲染与 Tab 状态机不变。
- 其余五张 ADVANTAGES SVG 未修改。

## 验证

- 独立完成帧：SVG 为 441×818、透明背景、41 条 path，三条修正轮廓均存在。
- 首页 1600×900：技术降本为 selected / `data-active-advantage="3"`，加载正确 `aria-label` 与 441×818 viewBox。
- 首页视觉容器仍为 `427.76×818px`，native wrapper 为 `427.76×793.44px`、scale `0.969972...`，符合既有 contain 规则。
- 页面横向溢出：0px。
- Console error / warning：0 / 0。
- source / dist 的目标 SVG 与 `site.js` 均字节同步。

## 截图

- `advantages-cost-perspective-v98-20261012.svg-preview.jpg`
- `advantages-cost-perspective-v98-20261012-homepage-1600.jpg`

