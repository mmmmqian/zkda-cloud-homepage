import { readFileSync, writeFileSync } from "node:fs";

const files = [
  "index.html",
  "pages/about.html",
  "pages/pricing.html",
  "pages/products/autodev.html",
  "pages/products/intelligent-computing-cloud.html",
  "pages/products/token-hub.html",
  "pages/resources/api-docs.html",
  "pages/resources/help-center.html",
  "pages/resources/product-docs.html",
  "pages/services/data-governance.html",
  "pages/services/maas-platform.html",
  "pages/services/operator-optimization.html",
  "pages/solutions/ai-application-development.html",
  "pages/solutions/domestic-computing-migration.html",
  "pages/solutions/enterprise-intelligent-computing-center.html",
  "pages/solutions/enterprise-large-model.html"
];

const iconByTitle = new Map([
  ["智算云平台", "cloud-server"],
  ["Token Hub", "token-network"],
  ["AutoDev", "code-window"],
  ["国产算力迁移", "migration"],
  ["企业智算中心", "datacenter"],
  ["企业大模型", "model-nodes"],
  ["AI 应用开发", "app-flow"],
  ["算子优化", "chip"],
  ["数据治理", "database"],
  ["MaaS 搭建", "layers"],
  ["产品文档", "book"],
  ["API 文档", "api"],
  ["帮助中心", "help"]
]);

for (const file of files) {
  let html = readFileSync(file, "utf8");
  const prefix = html.match(/src="((?:\.\.\/)*)assets\/brand\/logo-lockup\.svg/)?.[1] ?? "";

  html = html.replace(/\n\s*<div class="nav-panel__aside">[\s\S]*?<\/div>/g, "");
  html = html.replace(/<div class="nav-panel__main">/g, '<div class="nav-panel__main nav-panel__group">');
  html = html.replace(/<div class="nav-panel nav-panel--single__main nav-panel__group">/g, '<div class="nav-panel__main nav-panel__group">');
  html = html.replace(/<div class="nav-panel"(\s+aria-label=)/g, '<div class="nav-panel nav-panel--single"$1');

  if (!html.includes("nav-panel__item-icon")) {
    html = html.replace(
      /<a class="nav-panel__item"([^>]*)><i aria-hidden="true">(\d+)<\/i><span><strong>([^<]+)<\/strong><small>([^<]+)<\/small><\/span><\/a>/g,
      (match, attributes, index, title, description) => {
        const icon = iconByTitle.get(title.trim());
        if (!icon) throw new Error(`Missing icon mapping for ${title} in ${file}`);
        const sprite = `${prefix}assets/icons/navigation/nav-icons.svg`;
        return `<a class="nav-panel__item"${attributes}><span class="nav-panel__item-icon" aria-hidden="true"><svg class="nav-panel__item-glyph" viewBox="0 0 24 24"><use href="${sprite}#${icon}"></use></svg><span class="nav-panel__item-index">${index}</span></span><span class="nav-panel__item-body"><strong>${title}</strong><small>${description}</small></span><span class="nav-panel__item-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="${sprite}#arrow-right"></use></svg></span></a>`;
      }
    );
  }

  html = html.replace(/(site\.css\?v=)[^"]+/g, "$120261010-dropdown-visual-v93");
  html = html.replace(/(content\.css\?v=)[^"]+/g, "$120261010-dropdown-visual-v93");
  html = html.replace(/(site\.js\?v=)[^"]+/g, "$120261010-dropdown-visual-v93");
  writeFileSync(file, html);
}

console.log(`Updated ${files.length} source HTML files.`);
