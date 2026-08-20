<!-- GENERATED FILE. DO NOT EDIT DIRECTLY. -->
<!-- source-group: spec -->
<!-- source-files: requirements.md, reference.md, sitemap.md, content.md -->
<!-- source-sha256: f2c02e1f0a8c972fd5800186b6bfa1568e9026d6c5ab23d59ff444c3b50596ad -->

# Website Specification

> Generated from canonical files in `docs/source/`. Edit those files and run the assembler again.

---

<!-- BEGIN SOURCE: requirements.md -->

# 网站目标与范围

- Status: locked
- Updated in stage: requirements
- User approval: approved by `next:reference` on 2026-08-20

## Decisions

### 项目与语言

- 正式品牌名称：中科达云
- 英文标识：ZKDA Cloud
- 网站语言：简体中文，不提供整站语言切换
- 交付类型：语义化多页面静态 HTML/CSS/JavaScript 网站
- 范围级别：Standard；7 个独立页面类型、16 个计划页面，其中 15 个出现在主导航或下拉菜单，“联系我们”保留在页脚

### 网站目的

1. 让企业访客快速理解中科达云是一套 AI 基础设施平台。
2. 解释中科达云如何连接国产算力、模型服务与 AI 应用开发。
3. 建立“一云多芯、平滑迁移、安全可控、技术降本”的差异认知。
4. 引导有意向的访客进入现有登录/注册系统免费体验。

### 目标访客

- 主要访客：正在规划国产 AI 基础设施、智算中心或算力迁移的企业决策者。
- 次要访客：负责 AI 平台、算力运维、模型训练推理和应用开发的技术负责人。
- 补充访客：希望调用模型 API 或使用 AI 开发工具的开发团队。

### 主要动作

- 主要按钮：免费体验 / 立即注册
- 目标地址：`https://zhongkedayun.vercel.app/login`
- 次要动作：查看三大产品与国产算力迁移方案

### 顶部导航与页面类型

```text
/
└─ 首页（首页类型）

/pages/products/
├─ smart-cloud.html              智算云平台（产品详情类型）
├─ token-hub.html                Token Hub（产品详情类型）
└─ autodev.html                  AutoDev（产品详情类型）

/pages/solutions/
├─ migration.html                国产算力迁移（解决方案详情类型）
├─ enterprise-compute.html       企业智算中心（解决方案详情类型）
├─ enterprise-llm.html           企业大模型（解决方案详情类型）
└─ ai-app-development.html       AI 应用开发（解决方案详情类型）

/pages/services/
├─ operator-optimization.html    算子优化（专家服务详情类型）
├─ data-governance.html          数据治理（专家服务详情类型）
└─ maas-setup.html               MaaS 搭建（专家服务详情类型）

/pages/resources/
├─ product-docs.html             产品文档（资源类型，外部地址待确认）
├─ api-docs.html                 API 文档（资源类型，外部地址待确认）
└─ help-center.html              帮助中心（资源类型，外部地址待确认）

/pages/
├─ about.html                    关于我们（企业信息类型）
└─ contact.html                  联系我们（联系类型，仅页脚入口）
```

顶部导航固定为：首页；产品下拉；解决方案下拉；专家服务下拉；资源下拉；关于我们；登录；免费体验。登录与免费体验均进入现有外部系统。顶部分类名称本身暂不规划独立列表页。

首页的产品、解决方案和专家服务内容区承担各分类的总览入口；首版不另建分类列表页。资源项暂按本地静态资源页规划，如用户后续提供现有产品文档、API 文档或帮助中心地址，则改为外部链接。

### 首页内容顺序

1. 全局导航
2. 品牌定位首屏
3. 公开数据
4. AI 基础设施产品架构
5. 三大产品总览
6. 一云多芯
7. 平滑迁移
8. 平台能力
9. 中科达云核心优势
10. 国产算力迁移方案入口
11. 国产 AI 生态
12. 专家服务
13. 品牌信任说明
14. 最终免费体验入口
15. 页脚

### 已确认事实

- 三大产品为智算云平台、Token Hub、AutoDev。
- 核心差异为一云多芯、平滑迁移、技术降本、安全可控、智能运维及中科体系行业知识。
- 对外数据为：`5000+` 纳管 GPU 卡、`20+` 支持芯片厂商、`99.9%` 系统可用性、`100+` 服务企业。
- 可公开联系方式：`contact@zhongkedayun.com`、`400-888-0000`、`北京市海淀区中科大厦`。
- 已提供正式 Logo 的独立图形与中英文组合版本。
- Logo 可制作原品牌蓝、纯黑和反白三种使用版本，但结构、比例和图形关系保持不变。
- 2026-08-20 16:08 更新的中英文组合 Logo 已同步为网站当前使用版本；独立图形 Logo 未发生变化。

### 静态与动态边界

- 网站本身不实现账号、登录、注册、计费、控制台或数据提交。
- 免费体验按钮只跳转到现有外部登录页。
- 联系页展示可点击邮箱和电话，不在首版实现后台表单。
- 不包含部署、SEO、分析、CMS 或生产框架迁移。
- 首屏、产品架构和迁移流程计划使用 GSAP ScrollTrigger 实现滚动叙事。
- 动态效果只服务官网叙事；手机端、`prefers-reduced-motion`、JavaScript 关闭或动态依赖失败时，核心内容仍须完整可读和可操作。
- 最终验收视口为 `2560×1440`、`1920×1080`、`1180×820`、`820×1180`、`390×844`。
- 最终检查覆盖固定导航、移动菜单、键盘操作、焦点可见性、注册链接、电话与邮件链接。
- 最终检查不得存在死链、横向溢出、控制台错误、虚构案例、未经批准的图片或图片/动态依赖失败导致的内容缺失。
- 内部 `review/` 目录只用于阶段确认，不进入最终公开网站包。

### 已确认的后续设计偏好

- 整体浅色为主，首页首屏与最终转化区采用黑色重点区域。
- Logo 可使用原品牌蓝、纯黑和反白版本；网站加入少量荧光绿信号色。
- 动态参考 Transform9 的长页面叙事、固定导航、产品展示和互动节奏，但不得复制素材、代码或完整构图。
- 首批原创概念图片为两张：首页数字基础设施场景、国产算力迁移场景。

## Evidence and sources

- `/Volumes/mq work/codex/ZKDACloud/web/ZKDACloud_Homepage_Wireframe.md`：首页故事线、产品关系、首页内容顺序和已有文案方向。
- `/Volumes/mq work/codex/ZKDACloud/web/Design.md — 中文浅色科技官网设计系统.md`：浅色编辑式科技视觉、排版、颜色和克制装饰规则。
- `/Volumes/mq work/codex/ZKDACloud/web/中科达云 — 领先的AI基础设施平台.html`：现有页面内容、公开数据、产品入口和现有登录链接。
- `/Volumes/mq work/codex/ZKDACloud/web/logo.svg` 与 `/Volumes/mq work/codex/ZKDACloud/web/logo+文字.svg`：用户上传的正式品牌素材。
- 本轮对话：用户确认语言、范围、主要动作、公开数据、联系方式、Logo 使用、图片方向和动态强度。

以上绝对路径只用于说明原始资料位置；原始资料不复制进公开网站。

## Missing or unresolved

- 本阶段没有阻止需求确认的缺失信息。
- 待确认资源菜单的三个入口是由官网建设静态页面，还是跳转到现有文档系统；未提供外部地址前按本地页面规划。
- “联系我们”沿用上一版范围并放在页脚，不出现在本次用户给出的顶部导航中。
- 具体网站文字写法在内容阶段用同一组事实展示方案后确认。
- 两张生成图片的具体提示词、比例和候选结果在内容阶段另行确认。
- 参考网站的可复用交互原则与不可复制边界在下一阶段形成可见证据。

## Change log

- 2026-08-20：根据用户批准的实施计划建立首版需求与页面范围。
- 2026-08-20：根据用户给出的完整顶部导航，将范围从 6 个入口扩展为 16 个计划页面，并增加解决方案、专家服务、资源和关于我们入口。
- 2026-08-20：同步用户更新的中英文组合 Logo，并在首页资源地址加入版本标记以强制浏览器刷新缓存。
- 2026-08-20：用户输入 `next:reference`，网站目标、受众、语言、导航范围、页面数量、首页内容顺序、已知事实与静态边界获得批准并锁定。

<!-- END SOURCE: requirements.md -->

---

<!-- BEGIN SOURCE: reference.md -->

# 参考网站研究

- Status: draft
- Updated in stage: setup
- User approval: pending

## Decisions

尚未进入参考网站研究阶段。

## Evidence and sources

用户指定 `https://www.transform9.com/` 为视觉与互动参考。证据将在下一阶段按真实浏览器优先、网页抓取降级的规则记录。

## Missing or unresolved

- 需要记录参考网站的桌面与手机表现、导航、滚动、产品展示和互动状态。
- 需要明确可借鉴原则、拒绝模式与复制边界。

## Change log

- 2026-08-20：建立文档占位。

<!-- END SOURCE: reference.md -->

---

<!-- BEGIN SOURCE: sitemap.md -->

# 页面目录与访问关系

- Status: draft
- Updated in stage: setup
- User approval: pending

## Decisions

当前仅保存需求阶段提出的路线；正式页面关系将在页面目录阶段确认。

## Evidence and sources

待页面目录阶段补充。

## Missing or unresolved

- 页面内部区块、共用结构、短长内容和缺图状态尚未锁定。

## Change log

- 2026-08-20：建立文档占位。

<!-- END SOURCE: sitemap.md -->

---

<!-- BEGIN SOURCE: content.md -->

# 网站文字与图片

- Status: draft
- Updated in stage: setup
- User approval: pending

## Decisions

已知事实、Logo 和媒体偏好已记录在需求文档；尚未进入正式内容编写阶段。

## Evidence and sources

待内容阶段补充文字方案、素材来源、用途、权利状态、替代文字和裁切规则。

## Missing or unresolved

- 网站文字读起来的具体感觉尚未选择。
- 两张原创概念图片尚未确认具体生成批次。

## Change log

- 2026-08-20：建立文档占位。

<!-- END SOURCE: content.md -->
