// Build-time only: renders public pages to static HTML so crawlers that do not run
// JavaScript (AI search bots, link previews) can read their content.
// Used by scripts/prerender.mjs; never imported by the browser bundle.
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BootDataContext } from "@/lib/articles/boot";
import { articleHead, listingHead } from "@/lib/articles/seo";
import type { Article, ArticleSummary, ResourcesBootData } from "@/lib/articles/types";
import Index from "@/pages/Index";
import ResourceArticle from "@/pages/resources/article";
import ResourcesIndex from "@/pages/resources/index";

export function render(): string {
  return renderToString(
    <MemoryRouter initialEntries={["/"]}>
      <TooltipProvider>
        <Index />
      </TooltipProvider>
    </MemoryRouter>,
  );
}

/** One page of the « Ressources & Conseils » section (path = "/ressources" or "/ressources/<slug>"). */
export function renderResources(path: string, boot: ResourcesBootData): string {
  return renderToString(
    <BootDataContext.Provider value={boot}>
      <MemoryRouter initialEntries={[path]}>
        <TooltipProvider>
          <Routes>
            <Route path="/ressources" element={<ResourcesIndex />} />
            <Route path="/ressources/:slug" element={<ResourceArticle />} />
          </Routes>
        </TooltipProvider>
      </MemoryRouter>
    </BootDataContext.Provider>,
  );
}

export function listingPageHead(articles: ArticleSummary[]) {
  return listingHead("fr", articles);
}

export function articlePageHead(article: Article, translation: ArticleSummary | null) {
  return articleHead(article, translation);
}
