// Post-build step: injects server-rendered HTML for crawlers that do not execute JavaScript.
//  * dist/index.html                       : the home page (unchanged behaviour),
//  * dist/ressources/index.html            : the « Ressources & Conseils » listing,
//  * dist/ressources/<slug>/index.html     : one page per PUBLISHED article,
//  * dist/sitemap.xml                      : the home entries plus the section and its articles.
// The browser still mounts the app with createRoot, which replaces this markup, so the visible
// page and its behaviour are unchanged. Drafts are never fetched, hence never written.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.resolve(root, process.argv[2] ?? "dist/index.html");

// Some modules read browser storage when they load; give them a no-op stand-in.
const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};
globalThis.localStorage ??= memoryStorage;
globalThis.sessionStorage ??= memoryStorage;

const vite = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
  resolve: { alias: { "@": path.resolve(root, "src") } },
  esbuild: { jsx: "automatic" },
  ssr: { noExternal: [] },
});

const escapeHtml = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeXml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const jsonForHtml = (value) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/[\u2028\u2029]/g, " ");
const SITE = "https://datableia.com";
const marker = '<div id="root"></div>';

// Removes the home page's own head tags so each section page carries only its own.
function stripHomeHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+name="(?:description|robots|twitter:[^"]*)"[\s\S]*?\/?>\s*/gi, "")
    .replace(/<meta\s+property="og:[^"]*"[\s\S]*?\/?>\s*/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="alternate"\s+hreflang[^>]*>\s*/gi, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, "");
}

function renderHead(head) {
  const tags = head.tags.map(({ tag, attrs }) => {
    const attributes = Object.entries(attrs)
      .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
      .join(" ");
    return `  <${tag} ${attributes}${tag === "link" ? " />" : " />"}`;
  });
  const scripts = head.jsonLd.map((data) => `  <script type="application/ld+json">${jsonForHtml(data)}</script>`);
  return [`  <title>${escapeHtml(head.title)}</title>`, ...tags, ...scripts].join("\n") + "\n";
}

function buildPage(template, { head, appHtml, boot }) {
  let html = stripHomeHead(template);
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${head.lang}"`);
  html = html.replace("</head>", `${renderHead(head)}</head>`);
  html = html.replace(marker, `<div id="root">${appHtml}</div>`);
  html = html.replace(
    "</body>",
    `<script type="application/json" id="dt-resources-data">${jsonForHtml(boot)}</script>\n</body>`,
  );
  return html;
}

async function loadArticles(vite) {
  // Test hook: a JSON file with an array of articles, used by local build checks only.
  if (process.env.DT_ARTICLES_FIXTURE) {
    return JSON.parse(await readFile(process.env.DT_ARTICLES_FIXTURE, "utf8"));
  }
  const { fetchPublishedArticles } = await vite.ssrLoadModule("/src/lib/articles/api.ts");
  let last = "unknown error";
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const result = await fetchPublishedArticles(controller.signal).finally(() => clearTimeout(timer));
    if (result.ok) return result.data ?? [];
    // Table not created yet: there is simply nothing to publish.
    if (result.notProvisioned) return [];
    last = result.error ?? last;
    await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
  }
  throw new Error(`Could not fetch published articles (${last})`);
}

const toSummary = ({ seo_title, seo_description, author_name, author_role, content, status, created_at, updated_at, ...rest }) => rest;
const day = (iso) => String(iso).slice(0, 10);

function sitemapEntry({ loc, lastmod, alternates }) {
  const links = (alternates ?? [])
    .map(({ hreflang, href }) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}" />`)
    .join("\n");
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>${links ? `\n${links}` : ""}\n  </url>\n`;
}

try {
  // ---- Home page. A failure here never blocks a deploy: the app still works client-side.
  const pristine = await readFile(htmlPath, "utf8");
  try {
    const { render } = await vite.ssrLoadModule("/src/entry-prerender.tsx");
    const appHtml = render();
    if (!pristine.includes(marker)) throw new Error(`Root container not found in ${htmlPath}`);
    await writeFile(htmlPath, pristine.replace(marker, `<div id="root">${appHtml}</div>`));
    console.log(`Prerendered home page into ${path.relative(root, htmlPath)} (${appHtml.length} chars)`);
  } catch (error) {
    console.warn("Home prerender skipped, the page stays client-rendered:", error);
  }

  // ---- « Ressources & Conseils ».
  const distDir = path.dirname(htmlPath);
  let articles = [];
  let fetched = true;
  try {
    articles = await loadArticles(vite);
  } catch (error) {
    fetched = false;
    // On Netlify a failed fetch fails the build: the previous deploy stays live instead of
    // silently publishing a site without its articles. Locally it is only a warning.
    if (process.env.NETLIFY === "true") {
      console.error("Resources prerender failed:", error);
      process.exitCode = 1;
    } else {
      console.warn("Resources prerender skipped:", error);
    }
  }

  if (fetched && pristine.includes(marker)) {
    const { renderResources, listingPageHead, articlePageHead } = await vite.ssrLoadModule("/src/entry-prerender.tsx");
    const summaries = articles.map(toSummary);
    const entries = [];

    const writePage = async (relative, page) => {
      const file = path.join(distDir, relative);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, buildPage(pristine, page));
    };

    const listBoot = { list: summaries };
    await writePage("ressources/index.html", {
      head: listingPageHead(summaries),
      appHtml: renderResources("/ressources", listBoot),
      boot: listBoot,
    });
    const today = new Date().toISOString().slice(0, 10);
    const listingAlternates = [
      { hreflang: "fr", href: `${SITE}/ressources` },
      { hreflang: "en", href: `${SITE}/ressources?lang=en` },
      { hreflang: "x-default", href: `${SITE}/ressources` },
    ];
    entries.push(sitemapEntry({ loc: `${SITE}/ressources`, lastmod: today, alternates: listingAlternates }));
    entries.push(sitemapEntry({ loc: `${SITE}/ressources?lang=en`, lastmod: today, alternates: listingAlternates }));

    for (const article of articles) {
      const translation =
        summaries.find(
          (other) => other.lang !== article.lang && (other.translation_of === article.id || other.id === article.translation_of),
        ) ?? null;
      const boot = { list: summaries, article };
      await writePage(`ressources/${article.slug}/index.html`, {
        head: articlePageHead(article, translation),
        appHtml: renderResources(`/ressources/${article.slug}`, boot),
        boot,
      });
      const alternates = translation
        ? [
            { hreflang: "fr", href: `${SITE}/ressources/${article.lang === "fr" ? article.slug : translation.slug}` },
            { hreflang: "en", href: `${SITE}/ressources/${article.lang === "en" ? article.slug : translation.slug}` },
            { hreflang: "x-default", href: `${SITE}/ressources/${article.lang === "fr" ? article.slug : translation.slug}` },
          ]
        : [];
      entries.push(
        sitemapEntry({
          loc: `${SITE}/ressources/${article.slug}`,
          lastmod: day(article.modified_at ?? article.published_at),
          alternates,
        }),
      );
    }

    // Sitemap: keep the existing entries (home, both languages) and add the section.
    const sitemapPath = path.join(distDir, "sitemap.xml");
    const sitemap = await readFile(sitemapPath, "utf8");
    await writeFile(sitemapPath, sitemap.replace("</urlset>", `${entries.join("")}</urlset>`));
    console.log(`Prerendered /ressources and ${articles.length} article(s); sitemap updated`);
  }
} finally {
  await vite.close();
}
