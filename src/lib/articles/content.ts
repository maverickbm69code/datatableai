// Pure helpers on article documents (Tiptap / ProseMirror JSON): plain text, reading time,
// table of contents, slugs. No DOM access, so they run in the browser, in the build-time
// prerender and in tests alike.
import type { ArticleContent, DocNode } from "@/lib/articles/types";

export const WORDS_PER_MINUTE = 200;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");
}

const BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "listItem",
  "tableCell",
  "tableHeader",
  "keyFigure",
  "blockquote",
]);

/** Plain text of a node, with a space between blocks. */
export function nodeText(node: DocNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return " ";
  if (node.type === "barChart") {
    const data = Array.isArray(node.attrs?.data) ? (node.attrs?.data as { label?: string; value?: number }[]) : [];
    return [String(node.attrs?.title ?? ""), ...data.map((row) => `${row.label ?? ""} ${row.value ?? ""}`)].join(" ");
  }
  const inner = (node.content ?? []).map(nodeText).join(BLOCK_TYPES.has(node.type) ? "" : " ");
  return BLOCK_TYPES.has(node.type) ? `${inner} ` : inner;
}

export function documentText(content: ArticleContent | undefined): string {
  return (content?.content ?? [])
    .map(nodeText)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  const matches = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return matches ? matches.length : 0;
}

/** Reading time in whole minutes, never below 1. */
export function readingMinutes(content: ArticleContent | undefined): number {
  return Math.max(1, Math.ceil(countWords(documentText(content)) / WORDS_PER_MINUTE));
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

/** Headings (H2 and H3) with unique anchor ids, in document order. */
export function extractHeadings(content: ArticleContent | undefined): TocItem[] {
  const items: TocItem[] = [];
  const used = new Map<string, number>();

  for (const node of content?.content ?? []) {
    if (node.type !== "heading") continue;
    const level = node.attrs?.level === 3 ? 3 : 2;
    const text = nodeText(node).replace(/\s+/g, " ").trim();
    if (!text) continue;
    const base = slugify(text) || "section";
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    items.push({ id: count === 0 ? base : `${base}-${count + 1}`, text, level });
  }

  return items;
}
