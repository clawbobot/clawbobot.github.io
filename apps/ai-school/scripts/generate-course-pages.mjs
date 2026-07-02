// Generates static, crawlable landing pages for every AI Academy course at
// play-ai-school/courses/<courseId>/index.html. Course content lives inline in
// src/App.jsx (CATALOG); this script extracts it via esbuild and renders the
// full lesson content as static HTML so search engines can index it.
//
// Run from apps/ai-school:  node scripts/generate-course-pages.mjs
// Re-run whenever course content in src/App.jsx changes.

import { transform } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = join(appDir, '..', '..', 'play-ai-school', 'courses');
const SITE = 'https://bobot.is-a.dev';

// ── Extract CATALOG / ACADEMIES from App.jsx ─────────────────────────────────
const src = readFileSync(join(appDir, 'src', 'App.jsx'), 'utf8')
  + '\nexport { CATALOG, ACADEMIES };\n';
const { code } = await transform(src, { loader: 'jsx', jsx: 'automatic' });
const tmp = join(appDir, '.catalog-extract.tmp.mjs');
writeFileSync(tmp, code);
const { CATALOG, ACADEMIES } = await import(pathToFileURL(tmp).href);
rmSync(tmp);

// ── Helpers ──────────────────────────────────────────────────────────────────
const esc = (s) => String(s)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const CN = ['一', '二', '三', '四', '五', '六', '七', '八'];
const lessonCount = (c) => c.modules.reduce((n, m) => n + m.lessons.length, 0);

const CALLOUT_STYLE = {
  key:  { icon: '★', color: '#8b7cff' },
  tip:  { icon: '💡', color: '#48d6b0' },
  note: { icon: 'ℹ', color: '#a0a7b8' },
  warn: { icon: '⚠', color: '#f97316' },
};

function renderBlock(b) {
  switch (b.t) {
    case 'lead': return `<p class="lead">${esc(b.text)}</p>`;
    case 'h': return `<h4>${esc(b.text)}</h4>`;
    case 'p': return `<p>${esc(b.text)}</p>`;
    case 'list': return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'callout': {
      const s = CALLOUT_STYLE[b.variant] || CALLOUT_STYLE.note;
      return `<aside class="callout" style="--c:${s.color}"><span class="callout-tag">${s.icon} ${esc(b.tag || '')}</span><p>${esc(b.text)}</p></aside>`;
    }
    case 'prompt': return `<div class="prompt"><div class="prompt-bar">示例 Prompt</div><pre>${esc(b.text)}</pre></div>`;
    case 'quiz':
      return `<details class="quiz"><summary>🧠 自测：${esc(b.q)}</summary><ol type="A">${
        b.options.map((o, i) => `<li${i === b.answer ? ' class="right"' : ''}>${esc(o)}${i === b.answer ? '　✓' : ''}</li>`).join('')
      }</ol><p class="explain">${esc(b.explain)}</p></details>`;
    case 'task':
      return `<aside class="task"><p class="task-title">✏️ 动手练习：${esc(b.title)}</p><ol>${b.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></aside>`;
    default: return '';
  }
}

// ── Page template ────────────────────────────────────────────────────────────
function coursePage(course) {
  const url = `${SITE}/play-ai-school/courses/${course.id}/`;
  const academy = ACADEMIES[course.academy];
  const nLessons = lessonCount(course);
  const title = `${course.title} 中文课程 · AI 学院`;
  const desc = `${course.desc} ${course.modules.length} 个模块、${nLessons} 节课，全中文讲解，完全免费。`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    alternateName: course.en,
    description: desc,
    url,
    inLanguage: 'zh-CN',
    isAccessibleForFree: true,
    provider: { '@type': 'Person', name: 'Bob Pan', url: `${SITE}/` },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: `PT${Math.max(2, Math.round(nLessons / 4))}H` },
    syllabusSections: course.modules.map((m) => ({
      '@type': 'Syllabus',
      name: m.title,
      description: m.lessons.map((l) => l.title).join('；'),
    })),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bob Pan', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'AI 学院', item: `${SITE}/play-ai-school/` },
      { '@type': 'ListItem', position: 3, name: course.title, item: url },
    ],
  };

  const toc = course.modules.map((m, mi) => `
      <li><strong>模块${CN[mi]} · ${esc(m.title)}</strong><ul>${
        m.lessons.map((l) => `<li><a href="#${m.id}-${l.id}">${esc(l.title)}</a></li>`).join('')
      }</ul></li>`).join('');

  const content = course.modules.map((m, mi) => `
    <section class="module">
      <h2 id="${m.id}">模块${CN[mi]} · ${esc(m.title)} <span class="module-en">${esc(m.en)}</span></h2>
      ${m.lessons.map((l) => `
      <article class="lesson" id="${m.id}-${l.id}">
        <h3>${esc(l.title)}</h3>
        ${l.blocks.map(renderBlock).join('\n        ')}
      </article>`).join('')}
    </section>`).join('');

  const others = CATALOG.filter((c) => c.id !== course.id).map((c) => `
      <a class="other-card" href="/play-ai-school/courses/${c.id}/"><strong>${esc(c.title)}</strong><span>${esc(c.desc)}</span></a>`).join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="author" content="Bob Pan">
  <meta name="theme-color" content="#090a0f">
  <link rel="canonical" href="${url}">
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/play-ai-school/assets/share-card.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${SITE}/play-ai-school/assets/share-card.jpg">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
  <style>
    :root { color-scheme: dark; --bg:#090a0f; --surface:#11131b; --border:#292d3d; --text:#f1f3f8; --muted:#a0a7b8; --purple:#8b7cff; --green:#48d6b0; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--bg); color:var(--text); font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC",sans-serif; line-height:1.75; }
    a { color:var(--green); }
    .wrap { width:min(calc(100% - 2.5rem), 820px); margin:0 auto; }
    nav { border-bottom:1px solid var(--border); padding:0.9rem 0; font-size:0.9rem; }
    nav .wrap { display:flex; justify-content:space-between; align-items:center; gap:1rem; }
    .wordmark { color:var(--text); text-decoration:none; font-weight:800; }
    .wordmark span { color:var(--green); }
    nav a { text-decoration:none; }
    header.course { padding:3.5rem 0 2.5rem; }
    .badge { display:inline-block; background:rgba(139,124,255,0.18); color:var(--purple); font-size:0.75rem; font-weight:800; letter-spacing:0.1em; padding:0.25rem 0.7rem; border-radius:99px; margin-bottom:1rem; }
    h1 { font-size:clamp(2rem,6vw,3.2rem); line-height:1.1; letter-spacing:-0.03em; margin:0 0 0.5rem; }
    .course-en { color:var(--muted); font-size:1rem; margin:0 0 1.25rem; }
    .meta-line { display:flex; flex-wrap:wrap; gap:0.6rem; margin-bottom:1.25rem; font-size:0.85rem; color:var(--muted); }
    .meta-line span { border:1px solid var(--border); border-radius:99px; padding:0.2rem 0.7rem; }
    .cta { display:inline-block; background:var(--purple); color:#fff; font-weight:750; text-decoration:none; border-radius:9px; padding:0.7rem 1.3rem; margin-top:0.5rem; }
    .toc { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:1.5rem 1.75rem; margin-bottom:2.5rem; font-size:0.92rem; }
    .toc > p { margin:0 0 0.5rem; font-weight:800; }
    .toc ul { margin:0.25rem 0 0.75rem; padding-left:1.2rem; }
    .toc a { color:var(--muted); text-decoration:none; }
    .toc a:hover { color:var(--text); }
    h2 { font-size:1.6rem; letter-spacing:-0.02em; margin:3rem 0 1rem; padding-top:1.5rem; border-top:1px solid var(--border); }
    .module-en { display:block; font-size:0.85rem; font-weight:400; color:var(--muted); }
    h3 { font-size:1.25rem; margin:2.25rem 0 0.75rem; color:var(--green); }
    h4 { font-size:1.02rem; margin:1.5rem 0 0.5rem; }
    p, li { color:#cdd3e0; font-size:0.96rem; }
    .lead { color:var(--text); font-size:1.05rem; }
    .callout { border-left:3px solid var(--c); background:var(--surface); border-radius:0 10px 10px 0; padding:0.8rem 1.1rem; margin:1rem 0; }
    .callout-tag { font-size:0.78rem; font-weight:800; color:var(--c); }
    .callout p { margin:0.3rem 0 0; font-size:0.9rem; }
    .prompt { border:1px solid var(--border); border-radius:10px; overflow:hidden; margin:1rem 0; }
    .prompt-bar { background:var(--surface); border-bottom:1px solid var(--border); padding:0.4rem 0.9rem; font-size:0.75rem; font-weight:700; color:var(--muted); }
    .prompt pre { margin:0; padding:1rem; overflow-x:auto; font:0.85rem/1.7 ui-monospace,SFMono-Regular,Menlo,monospace; color:#cbd1df; white-space:pre-wrap; }
    .quiz { border:1px solid var(--border); border-radius:10px; padding:0.7rem 1rem; margin:1rem 0; background:var(--surface); font-size:0.92rem; }
    .quiz summary { cursor:pointer; font-weight:700; }
    .quiz .right { color:var(--green); font-weight:700; }
    .quiz .explain { color:var(--muted); font-size:0.88rem; }
    .task { border:1px dashed var(--border); border-radius:10px; padding:0.8rem 1.1rem; margin:1rem 0; }
    .task-title { margin:0 0 0.4rem; font-weight:800; color:var(--text); }
    .task ol { margin:0; padding-left:1.3rem; }
    .bottom-cta { text-align:center; padding:3rem 0; border-top:1px solid var(--border); margin-top:3rem; }
    .others { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:0.8rem; margin:1.5rem 0 3rem; }
    .other-card { display:flex; flex-direction:column; gap:0.3rem; border:1px solid var(--border); border-radius:12px; padding:1rem 1.1rem; background:var(--surface); text-decoration:none; font-size:0.85rem; }
    .other-card strong { color:var(--text); }
    .other-card span { color:var(--muted); }
    .other-card:hover { border-color:var(--purple); }
    footer { border-top:1px solid var(--border); padding:2rem 0 3rem; color:var(--muted); font-size:0.85rem; }
  </style>
</head>
<body>
  <nav><div class="wrap">
    <a class="wordmark" href="/">Bob<span>Pan</span></a>
    <div><a href="/play-ai-school/">进入互动学院 →</a></div>
  </div></nav>
  <main class="wrap">
    <header class="course">
      <div class="badge">🎓 ${esc(academy.name)} · 中文学习版 · 完全免费</div>
      <h1>${esc(course.title)}</h1>
      <p class="course-en">${esc(course.en)}</p>
      <div class="meta-line"><span>${esc(course.level)}</span><span>${course.modules.length} 个模块</span><span>${nLessons} 节课</span><span>全中文讲解</span></div>
      <p>${esc(course.longDesc)}</p>
      <a class="cta" href="/play-ai-school/">在互动学院中学习（含测验与进度保存）→</a>
    </header>
    <aside class="toc"><p>课程大纲</p><ul>${toc}
    </ul></aside>
${content}
    <div class="bottom-cta">
      <p>想要测验互动、进度自动保存的完整体验？</p>
      <a class="cta" href="/play-ai-school/">进入 AI 学院互动版 →</a>
    </div>
    <h2 style="border:none;padding-top:0">继续学习其他课程</h2>
    <div class="others">${others}
    </div>
  </main>
  <footer><div class="wrap">Bob Pan / clawbobot · <a href="/">bobot.is-a.dev</a> · 内容为 Anthropic 与 OpenAI 官方课程的中文学习版，仅供学习交流。</div></footer>
</body>
</html>
`;
}

// ── Generate ─────────────────────────────────────────────────────────────────
for (const course of CATALOG) {
  const dir = join(outRoot, course.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), coursePage(course));
  console.log(`wrote play-ai-school/courses/${course.id}/index.html (${lessonCount(course)} lessons)`);
}
