import { useContext, useEffect, useState } from "react";

import { fetchPublishedArticle, fetchPublishedSummaries } from "@/lib/articles/api";
import { BootDataContext, readBootFromDocument } from "@/lib/articles/boot";
import type { Article, ArticleSummary } from "@/lib/articles/types";

function useBoot() {
  const fromContext = useContext(BootDataContext);
  return fromContext ?? readBootFromDocument();
}

type ListState = { articles: ArticleSummary[]; loading: boolean };

/**
 * Published articles (summaries). Starts from the prerendered data when there is some, then
 * refreshes in the background so a visitor always sees the current list.
 */
export function useArticleList(): ListState {
  const boot = useBoot();
  const [articles, setArticles] = useState<ArticleSummary[] | null>(boot?.list ?? null);

  useEffect(() => {
    const controller = new AbortController();
    fetchPublishedSummaries(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) setArticles(result.data ?? []);
      else setArticles((previous) => previous ?? []);
    });
    return () => controller.abort();
  }, []);

  return { articles: articles ?? [], loading: articles === null };
}

export type ArticleState =
  | { status: "loading" }
  | { status: "found"; article: Article }
  | { status: "missing" };

export function useArticle(slug: string | undefined): ArticleState {
  const boot = useBoot();
  const prerendered = boot?.article && boot.article.slug === slug ? boot.article : null;
  const [state, setState] = useState<ArticleState>(
    prerendered ? { status: "found", article: prerendered } : { status: "loading" },
  );

  useEffect(() => {
    if (!slug) {
      setState({ status: "missing" });
      return;
    }
    const controller = new AbortController();
    if (!(prerendered && prerendered.slug === slug)) setState({ status: "loading" });

    fetchPublishedArticle(slug, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok && result.data) setState({ status: "found", article: result.data });
      else if (result.ok || result.notProvisioned) setState({ status: "missing" });
      // On a network error keep what is displayed (prerendered article) or show "missing".
      else setState((previous) => (previous.status === "found" ? previous : { status: "missing" }));
    });
    return () => controller.abort();
  }, [slug, prerendered]);

  return state;
}
