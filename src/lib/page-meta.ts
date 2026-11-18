// Applies a PageHead (see src/lib/articles/seo.ts) to the live document when the visitor moves
// between the « Ressources & Conseils » pages without a full reload. Tags created here are
// marked with data-dt-page and removed on cleanup; the shared ones (title, description,
// canonical, Open Graph) are simply overwritten by the next page.
import { useEffect } from "react";

import type { PageHead } from "@/lib/articles/seo";

const MARK = "data-dt-page";

function setMeta(tag: "meta" | "link", attrs: Record<string, string>) {
  const keyAttr = attrs.name ? "name" : attrs.property ? "property" : "rel";
  const key = attrs[keyAttr];
  const multiple = keyAttr === "rel" && attrs.rel === "alternate";
  let node: Element | null = multiple
    ? null
    : document.head.querySelector(`${tag}[${keyAttr}="${key}"]`);
  if (!node) {
    node = document.createElement(tag);
    node.setAttribute(MARK, "");
    document.head.appendChild(node);
  }
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
}

export function applyPageHead(head: PageHead) {
  document.documentElement.lang = head.lang;
  document.title = head.title;

  // Home-page leftovers that would contradict this page.
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((node) => node.remove());
  document.head.querySelectorAll('meta[property^="article:"], meta[property="og:locale:alternate"]').forEach((node) => node.remove());

  for (const { tag, attrs } of head.tags) setMeta(tag, attrs);

  for (const data of head.jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(MARK, "");
    script.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
    document.head.appendChild(script);
  }

  return () => {
    document.head
      .querySelectorAll(`script[type="application/ld+json"][${MARK}], link[rel="alternate"][hreflang][${MARK}], meta[property^="article:"][${MARK}], meta[property="og:locale:alternate"][${MARK}]`)
      .forEach((node) => node.remove());
  };
}

export function usePageHead(head: PageHead | null) {
  const key = head ? JSON.stringify(head) : "";
  useEffect(() => {
    if (!head) return;
    return applyPageHead(head);
    // `key` stands for the whole head object (a new object is built on every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
