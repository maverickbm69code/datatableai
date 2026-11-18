// Custom Tiptap blocks of the article editor. Their JSON shape is the one understood by
// src/components/resources/article-content.tsx (display) and supabase/functions/admin-articles
// (server-side validation): keep the three in sync.
import { Node, mergeAttributes } from "@tiptap/react";

export const CALLOUT_VARIANTS = [
  { value: "conseil", label: "Conseil" },
  { value: "attention", label: "Attention" },
  { value: "info", label: "Info" },
] as const;

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "paragraph+",
  defining: true,
  addAttributes() {
    return { variant: { default: "conseil" } };
  },
  parseHTML() {
    return [{ tag: "aside[data-callout]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ["aside", mergeAttributes(HTMLAttributes, { "data-callout": node.attrs.variant, class: `dt-callout dt-callout-${node.attrs.variant}` }), 0];
  },
});

export const KeyFigure = Node.create({
  name: "keyFigure",
  content: "paragraph paragraph",
  defining: true,
  parseHTML() {
    return [{ tag: "div[data-key-figure]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-key-figure": "", class: "dt-key-figure" }), 0];
  },
});

export const KeyFigures = Node.create({
  name: "keyFigures",
  group: "block",
  content: "keyFigure{1,4}",
  defining: true,
  parseHTML() {
    return [{ tag: "div[data-key-figures]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-key-figures": "", class: "dt-key-figures" }), 0];
  },
});

/** Atom block: its data is edited through a dialog, not inline. */
export const BarChart = Node.create({
  name: "barChart",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      title: { default: "" },
      unit: { default: "" },
      data: { default: [] },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-bar-chart]" }];
  },
  renderHTML({ node }) {
    const rows = (node.attrs.data as { label: string; value: number }[]) ?? [];
    return [
      "div",
      { "data-bar-chart": "", class: "dt-bar-chart" },
      `Graphique : ${node.attrs.title || "sans titre"} (${rows.length} ligne${rows.length > 1 ? "s" : ""})`,
    ];
  },
});
