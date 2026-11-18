// Post-build step: injects the server-rendered home page into dist/index.html.
// The browser still mounts the app with createRoot, which replaces this markup,
// so the visible page and its behaviour are unchanged. Only crawlers that do not
// execute JavaScript benefit from the static HTML.
import { readFile, writeFile } from "node:fs/promises";
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

// A prerender failure must never block a deploy: the app still works client-side.
try {
  const { render } = await vite.ssrLoadModule("/src/entry-prerender.tsx");
  const appHtml = render();
  const html = await readFile(htmlPath, "utf8");
  const marker = '<div id="root"></div>';
  if (!html.includes(marker)) {
    throw new Error(`Root container not found in ${htmlPath}`);
  }
  await writeFile(htmlPath, html.replace(marker, `<div id="root">${appHtml}</div>`));
  console.log(`Prerendered home page into ${path.relative(root, htmlPath)} (${appHtml.length} chars)`);
} catch (error) {
  console.warn("Prerender skipped, the page stays client-rendered:", error);
} finally {
  await vite.close();
}
