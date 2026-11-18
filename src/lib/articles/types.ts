import type { CategoryKey } from "@/lib/articles/categories";
import type { Lang } from "@/lib/i18n";

export type ArticleStatus = "draft" | "published";

/** ProseMirror / Tiptap document. Only the node and mark types in content.ts are accepted. */
export type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
};

export type ArticleContent = { type: "doc"; content?: DocNode[] };

/** Fields shown on cards and in lists (no body). */
export type ArticleSummary = {
  id: string;
  slug: string;
  lang: Lang;
  category: CategoryKey;
  icon: string | null;
  title: string;
  excerpt: string;
  reading_minutes: number;
  published_at: string;
  modified_at: string | null;
  translation_of: string | null;
};

export type Article = ArticleSummary & {
  seo_title: string | null;
  seo_description: string | null;
  author_name: string;
  author_role: string | null;
  content: ArticleContent;
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
};

/** What the admin sends when saving (id is absent on creation). */
export type ArticleDraftInput = {
  id?: string;
  slug: string;
  lang: Lang;
  category: CategoryKey;
  icon: string | null;
  title: string;
  excerpt: string;
  seo_title: string | null;
  seo_description: string | null;
  author_name: string;
  author_role: string | null;
  content: ArticleContent;
  translation_of: string | null;
  mark_modified: boolean;
};

/** Row shown in the admin list. */
export type AdminArticleRow = {
  id: string;
  slug: string;
  lang: Lang;
  category: CategoryKey;
  title: string;
  status: ArticleStatus;
  published_at: string | null;
  updated_at: string;
  reading_minutes: number;
  translation_of: string | null;
};

/** Data embedded in prerendered pages so the client can start without a request. */
export type ResourcesBootData = {
  list: ArticleSummary[];
  article?: Article;
};
