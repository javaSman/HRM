/**
 * build-overview.js
 * 从 Markdown 源码生成 项目总览.html（交互式项目模块总览 SPA）
 *
 * 用法：node build-overview.js
 * 输出：项目总览.html
 *
 * 依赖文件（必须放在同一目录）：
 *   build-overview-template.html  ← 模板（CSS+HTML壳+JS逻辑，含 {{变量}} 占位符）
 *   build-overview-meta.json     ← 模块元数据 + project 项目配置（project 可全部省略，自动识别）
 *   项目总览.md                  ← 首页架构 mermaid 图
 *   各模块 README.md             ← 按 meta 中的路径自动扫描
 *
 * 零硬编码：项目名、仓库地址、分支等全部从 git 自动识别，
 * meta.json 的 project 段只做覆盖。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const TEMPLATE_HTML = path.join(ROOT, 'build-overview-template.html');
const META_JSON = path.join(ROOT, 'build-overview-meta.json');
// 总览文档放在仓库根目录，构建脚本位于前端子项目目录。
const OVERVIEW_MD = fs.existsSync(path.join(ROOT, '项目总览.md'))
  ? path.join(ROOT, '项目总览.md')
  : path.join(ROOT, '..', '项目总览.md');
// 与仓库根目录的 项目总览.md 配套输出，避免在前端子目录生成孤立副本。
const OUTPUT_HTML = path.join(ROOT, '..', '项目总览.html');
const PKG_JSON = path.join(ROOT, 'package.json');

// ─── 工具函数 ─────────────────────────────────────────────────
function exec(cmd) {
  try { return execSync(cmd, { encoding: 'utf-8', cwd: ROOT }).trim(); }
  catch (e) { return ''; }
}

// ─── 0. 自动识别项目信息 ─────────────────────────────────────
console.log('[0/7] 自动识别项目信息…');

// 从 git remote 识别
const gitRemote = exec('git remote get-url origin');
// 支持多种 git URL 格式：
//   https://gitee.com/owner/repo.git
//   https://github.com/owner/repo.git
//   git@gitee.com:owner/repo.git
//   git@github.com:owner/repo.git
let repoOwner = '', repoName = '', gitHost = 'github.com', gitRawPrefix = '';
const remoteMatch = gitRemote.match(/[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
if (remoteMatch) {
  repoOwner = remoteMatch[1];
  repoName = remoteMatch[2];
}
if (gitRemote.includes('gitee.com')) {
  gitHost = 'gitee.com';
} else if (gitRemote.includes('github.com')) {
  gitHost = 'github.com';
} else if (gitRemote.includes('gitlab.com') || gitRemote.includes('gitlab.')) {
  gitHost = 'gitlab.com';
}
// 猜测默认分支
let gitBranch = exec('git rev-parse --abbrev-ref HEAD');
// 尝试获取远程默认分支
let gitDefaultBranch = exec('git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null');
if (gitDefaultBranch) {
  gitDefaultBranch = gitDefaultBranch.replace(/^refs\/remotes\/origin\//, '');
} else {
  gitDefaultBranch = gitBranch || 'master';
}
// 构建 raw 文件前缀（Gitee/GitHub raw 路径规则不同）
if (gitHost === 'gitee.com') {
  gitRawPrefix = 'https://gitee.com/' + repoOwner + '/' + repoName + '/blob/' + gitDefaultBranch;
} else if (gitHost === 'github.com') {
  gitRawPrefix = 'https://github.com/' + repoOwner + '/' + repoName + '/blob/' + gitDefaultBranch;
} else {
  gitRawPrefix = 'https://' + gitHost + '/' + repoOwner + '/' + repoName + '/blob/' + gitDefaultBranch;
}
const gitHome = 'https://' + gitHost + '/' + repoOwner + '/' + repoName;
const gitLastCommit = exec('git log -1 --format="%s"');
const gitLastCommitShort = exec('git log -1 --format="%h %s"');

// 从 package.json 识别（前端项目）
let pkgName = '', pkgDesc = '';
if (fs.existsSync(PKG_JSON)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(PKG_JSON, 'utf-8'));
    pkgName = pkg.name || '';
    pkgDesc = pkg.description || '';
  } catch (e) { /* ignore */ }
}

// 自动推断项目显示名：package.json name > git repo name > 目录名
const autoProjectName = pkgName || repoName || path.basename(ROOT);
const autoProjectTitle = autoProjectName + ' · 项目模块总览';
const autoBrandSub = autoProjectName + ' · 项目模块总览';
const autoHeroTitle = autoProjectName;
const autoHeroSub = (gitHost + ' · ' + gitDefaultBranch + (gitLastCommitShort ? ' · 最近提交: ' + gitLastCommitShort : ''));
const autoTechBadges = '';

console.log('   仓库地址：' + (gitRemote || '(未检测到 git)'));
console.log('   自动项目名：' + autoProjectName);
console.log('   默认分支：' + gitDefaultBranch);
console.log('   git 最近提交：' + (gitLastCommit || '(无)'));

// ─── 1. 读取模板 ─────────────────────────────────────────────
console.log('[1/7] 读取模板…');
if (!fs.existsSync(TEMPLATE_HTML)) {
  console.error('❌ 缺少模板文件：' + TEMPLATE_HTML);
  process.exit(1);
}
let template = fs.readFileSync(TEMPLATE_HTML, 'utf-8');
if (!template.includes('{{DATA}}')) {
  console.error('❌ 模板中未找到 {{DATA}} 占位符');
  process.exit(1);
}
console.log('   模板大小：' + template.length + ' bytes');

// ─── 2. 读取 META 元数据 ─────────────────────────────────────
console.log('[2/7] 读取 META 元数据…');
let meta;
if (fs.existsSync(META_JSON)) {
  meta = JSON.parse(fs.readFileSync(META_JSON, 'utf-8'));
} else {
  console.log('   ⚠ 未找到 build-overview-meta.json，使用空配置');
  meta = { modules: {}, groups: {} };
}

// 合并 project 配置：手动配置覆盖自动识别
const proj = Object.assign({
  // 以下为自动识别的默认值，在 meta.json 的 project 段可覆盖
  pageTitle:           autoProjectTitle,
  brandName:           autoProjectName,
  brandSub:            autoBrandSub,
  heroTitle:           autoHeroTitle,
  heroTitleExtra:      '',
  heroSub:             autoHeroSub,
  techBadges:          autoTechBadges,
  giteeHome:           gitHome,
  giteeRawPrefix:      gitRawPrefix,
  indexBackendReadme:  '',
  indexFrontendReadme: '',
  // 分组配置默认值（可被 meta.json 的 groups 段覆盖）
}, meta.project || {});

console.log('   项目名称：' + proj.brandName);
console.log('   后端模块组：' + Object.keys(meta.modules?.backend || meta.backend || {}).join(', '));
console.log('   前端模块组：' + Object.keys(meta.modules?.frontend || meta.frontend || {}).join(', '));

// ─── 3. 用项目配置替换模板中的 {{变量}} ──────────────────────
console.log('[3/7] 替换项目变量…');
const vars = {
  '{{PAGE_TITLE}}':           proj.pageTitle || '',
  '{{BRAND_NAME}}':           proj.brandName || '',
  '{{BRAND_SUB}}':            proj.brandSub || '',
  '{{HERO_TITLE}}':           proj.heroTitle || '',
  '{{HERO_TITLE_EXTRA}}':     proj.heroTitleExtra || '',
  '{{HERO_SUB}}':             proj.heroSub || '',
  '{{TECH_BADGES}}':          proj.techBadges || '',
  '{{GITEE_HOME}}':           proj.giteeHome || '#',
  '{{GITEE_RAW}}':            proj.giteeRawPrefix || '',
  '{{INDEX_BACKEND_README}}': proj.indexBackendReadme || '',
  '{{INDEX_FRONTEND_README}}': proj.indexFrontendReadme || '',
};
for (const [key, val] of Object.entries(vars)) {
  template = template.split(key).join(val);
}
console.log('   已替换 ' + Object.keys(vars).length + ' 个变量');

// ─── 4. 加载各模块 README → DOCS ────────────────────────────
console.log('[4/7] 加载各模块 README.md…');

const rawPrefix = proj.giteeRawPrefix || '';

/**
 * 从模块条目解析本地 README 路径。
 * 支持两种写法：
 *   1. "gitee": "https://gitee.com/owner/repo/blob/master/path/README.md"
 *      → 用 giteeRawPrefix 反推本地路径
 *   2. "readme": "path/to/README.md"
 *      → 直接作为本地路径（优先使用）
 */
function resolveLocalPath(mod) {
  // 优先使用 readme 字段（直接本地路径）
  if (mod.readme) return mod.readme;
  // 回退：从 gitee URL 反推
  if (mod.gitee && rawPrefix && mod.gitee.startsWith(rawPrefix + '/')) {
    return mod.gitee.substring(rawPrefix.length + 1);
  }
  if (mod.gitee && rawPrefix && mod.gitee.startsWith(rawPrefix)) {
    return mod.gitee.substring(rawPrefix.length);
  }
  return null;
}

const docs = {};
let loadedCount = 0;
let missCount = 0;
const misses = [];

// 兼容新旧 meta.json 格式：modules 或直接的 backend/frontend
const moduleSource = meta.modules || meta;

function loadDocsFromGroup(groups) {
  if (!groups) return;
  for (const sectionKey of Object.keys(groups)) {
    const mods = groups[sectionKey];
    if (!Array.isArray(mods)) continue;
    for (const mod of mods) {
      const localPath = resolveLocalPath(mod);
      if (!localPath) {
        missCount++;
        misses.push('[路径不匹配] ' + mod.slug + ' → 未配置 readme 且 gitee URL 前缀不匹配');
        docs[mod.slug] = '# ' + (mod.name || mod.slug) + '\n\n> ⚠ 无法定位本地文档\n';
        continue;
      }
      const fullPath = path.join(ROOT, localPath);
      if (fs.existsSync(fullPath)) {
        docs[mod.slug] = fs.readFileSync(fullPath, 'utf-8');
        loadedCount++;
      } else {
        missCount++;
        misses.push('[文件缺失] ' + mod.slug + ' → ' + localPath);
        docs[mod.slug] = '# ' + (mod.name || mod.slug) + '\n\n> ⚠ 文档文件不存在：`' + localPath + '`\n';
      }
    }
  }
}

// 加载模块文档
if (moduleSource.backend) loadDocsFromGroup(moduleSource.backend);
if (moduleSource.frontend) loadDocsFromGroup(moduleSource.frontend);

// 总索引页
const indexBackend = proj.indexBackendReadme;
const indexFrontend = proj.indexFrontendReadme;
if (indexBackend) {
  const fp = path.join(ROOT, indexBackend);
  if (fs.existsSync(fp)) { docs['ov-backend'] = fs.readFileSync(fp, 'utf-8'); loadedCount++; }
  else { missCount++; misses.push('[索引缺失] ov-backend → ' + indexBackend); }
}
if (indexFrontend) {
  const fp = path.join(ROOT, indexFrontend);
  if (fs.existsSync(fp)) { docs['ov-frontend'] = fs.readFileSync(fp, 'utf-8'); loadedCount++; }
  else { missCount++; misses.push('[索引缺失] ov-frontend → ' + indexFrontend); }
}

console.log('   已加载：' + loadedCount + '  缺失：' + missCount);
if (misses.length > 0) {
  console.log('   缺失列表：');
  misses.forEach(function (m) { console.log('     - ' + m); });
}

// ─── 5. 提取架构 mermaid 图 ─────────────────────────────────
console.log('[5/7] 提取架构 mermaid 图…');
let archDiagram = '';
if (fs.existsSync(OVERVIEW_MD)) {
  const overviewMd = fs.readFileSync(OVERVIEW_MD, 'utf-8');
  const mermaidMatch = overviewMd.match(/```mermaid\s*([\s\S]*?)```/);
  if (mermaidMatch) {
    archDiagram = mermaidMatch[1].replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    console.log('   已提取 mermaid 架构图（' + archDiagram.length + ' 字符）');
  } else {
    console.log('   ⚠ 项目总览.md 中未找到 mermaid 代码块');
  }
} else {
  console.log('   ⚠ 未找到 项目总览.md');
}

// ─── 6. 统计 ────────────────────────────────────────────────
console.log('[6/7] 计算统计数据…');
const beMods = [].concat.apply([], Object.values(moduleSource.backend || {}).map(function (g) { return g || []; }));
const feMods = [].concat.apply([], Object.values(moduleSource.frontend || {}).map(function (g) { return g || []; }));

let totalMermaid = archDiagram ? 1 : 0;
for (const content of Object.values(docs)) {
  const matches = content.match(/```mermaid/g);
  if (matches) totalMermaid += matches.length;
}
// 交互式业务流程下钻图也计入首页流程图统计
for (const flow of Object.values(meta.businessFlows || {})) {
  if (flow && flow.diagram) totalMermaid += 1;
}

// 组装最终 meta（包含自动识别的 project + 手动配置的 modules + 计算出的 stats）
const finalMeta = {
  // 分组配置（模板 JS 用）
  groups: meta.groups || getDefaultGroups(meta),
  // 统计标签（模板 JS 用）
  statLabels: meta.statLabels || {
    backend: '后端模块',
    frontend: '前端模块',
    mermaid: 'Mermaid 流程图',
    docs: 'README 文档'
  },
  // 模块数据
  backend: moduleSource.backend || {},
  frontend: moduleSource.frontend || {},
  // 平台登录后实际菜单树（按线上菜单顺序）
  menu: meta.menu || [],
  // 一级菜单对应的业务流程图（非 HR 业务菜单也有独立说明）
  menuFlows: meta.menuFlows || {},
  // 首页业务流程下钻配置（由模板负责交互渲染）
  businessFlows: meta.businessFlows || {},
  // 项目配置
  project: proj,
  // 统计数据
  stats: {
    backend: beMods.length,
    frontend: feMods.length,
    mermaid: totalMermaid,
    docs: Object.keys(docs).length
  }
};

// 生成默认分组配置
function getDefaultGroups(inputMeta) {
  const src = inputMeta.modules || inputMeta;
  const groups = {};
  if (src.backend) {
    groups.backend = { label: '后端', sections: [] };
    Object.keys(src.backend).forEach(function (key) {
      groups.backend.sections.push({ key: key, name: key, color: 'var(--accent)' });
    });
  }
  if (src.frontend) {
    groups.frontend = { label: '前端', sections: [] };
    Object.keys(src.frontend).forEach(function (key) {
      groups.frontend.sections.push({ key: key, name: key, color: 'var(--accent)' });
    });
  }
  // 如果未配置 groups，用 meta 中的 key 名推断颜色
  applyDefaultColors(groups);
  return groups;
}

function applyDefaultColors(groups) {
  const colorPalette = ['#10b981', '#e8950c', '#8b5cf6', '#0ea5e9', '#ef4444', '#f59e0b'];
  let ci = 0;
  for (const side of Object.values(groups)) {
    for (const sec of (side.sections || [])) {
      if (!sec.color || sec.color === 'var(--accent)') {
        sec.color = colorPalette[ci % colorPalette.length];
        ci++;
      }
    }
  }
}

console.log('   stats: ' + JSON.stringify(finalMeta.stats));

// ─── 7. 组装输出 ────────────────────────────────────────────
console.log('[7/7] 生成 HTML…');

// 安全转义函数：确保 JSON 字符串在 <script> 标签中安全使用
function safeScriptStringify(obj) {
  const json = JSON.stringify(obj);
  // 使用 Unicode 转义 </ 防止浏览器提前解析
  return json.replace(/<\//g, '\\u003C/');
}

const metaJSON = safeScriptStringify(finalMeta);
const docsJSON = safeScriptStringify(docs);
const archJSON = safeScriptStringify(archDiagram);

const dataLine = '<script>const META=' + metaJSON
  + ';const DOCS=' + docsJSON
  + ';const ARCH=' + archJSON
  + ';<\/script>';

const output = template.replace('{{DATA}}', dataLine);
fs.writeFileSync(OUTPUT_HTML, output, 'utf-8');

const sizeKB = (output.length / 1024).toFixed(1);
console.log('\n✅ 生成完成！');
console.log('   输出文件：' + OUTPUT_HTML);
console.log('   文件大小：' + sizeKB + ' KB');
