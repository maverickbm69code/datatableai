import { CalendarDays, Clock, Linkedin, RefreshCw, UserRound } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { FlipWords } from "@/components/motion/flip-words";
import { Reveal } from "@/components/motion/reveal";
import { ArticleCard } from "@/components/resources/article-card";
import { ArticleContentView } from "@/components/resources/article-content";
import { ArticleCta } from "@/components/resources/article-cta";
import { ArticleLanguageSwitch } from "@/components/resources/article-language-switch";
import { ArticleToc } from "@/components/resources/article-toc";
import { ResourcesLayout } from "@/components/resources/resources-layout";
import { SectionHeading } from "@/components/site/section-heading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/articles/categories";
import { extractHeadings } from "@/lib/articles/content";
import { formatArticleDate, readingTimeLabel } from "@/lib/articles/format";
import { articleHead, articleUrl, sectionLabel } from "@/lib/articles/seo";
import type { Article, ArticleSummary } from "@/lib/articles/types";
import { useArticle, useArticleList } from "@/lib/articles/use-articles";
import { LangOverride, useCopy, type Lang } from "@/lib/i18n";
import { usePageHead } from "@/lib/page-meta";
import NotFound from "@/pages/NotFound";

const COPY = {
  fr: {
    home: "Accueil",
    by: "Par",
    published: "Publié le",
    updated: "Mis à jour le",
    share: "Partager sur LinkedIn",
    related: "À lire aussi",
    relatedEyebrow: "Continuer la lecture",
    loading: "Chargement de l'article…",
    missing: "Cet article n'existe pas ou n'est plus publié.",
    back: "Voir toutes les ressources",
  },
  en: {
    home: "Home",
    by: "By",
    published: "Published",
    updated: "Updated",
    share: "Share on LinkedIn",
    related: "Keep reading",
    relatedEyebrow: "Related articles",
    loading: "Loading the article…",
    missing: "This article does not exist or is no longer published.",
    back: "See all resources",
  },
};

function linkedInShareUrl(slug: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl(slug))}`;
}

function relatedArticles(article: Article, list: ArticleSummary[]) {
  const pool = list.filter((item) => item.id !== article.id && item.lang === article.lang);
  const sameCategory = pool.filter((item) => item.category === article.category);
  const others = pool.filter((item) => item.category !== article.category);
  return [...sameCategory, ...others].slice(0, 3);
}

function ArticleView({ article, list }: { article: Article; list: ArticleSummary[] }) {
  const t = useCopy(COPY);
  const lang = article.lang;
  const translation = useMemo(
    () =>
      list.find(
        (item) => item.lang !== lang && (item.translation_of === article.id || item.id === article.translation_of),
      ) ?? null,
    [list, lang, article.id, article.translation_of],
  );
  const toc = useMemo(() => extractHeadings(article.content), [article.content]);
  const related = useMemo(() => relatedArticles(article, list), [article, list]);

  usePageHead(articleHead(article, translation));

  const showUpdated = Boolean(article.modified_at);

  return (
    <ResourcesLayout languageSlot={<ArticleLanguageSwitch lang={lang} translation={translation} />}>
      <article>
        <header className="hero-glow relative overflow-hidden">
          <div className="shell pb-10 pt-10 md:pb-14 md:pt-14">
            <Reveal y={8} duration={0.5}>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">{t.home}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/ressources">{sectionLabel(lang)}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="max-w-[22ch] truncate sm:max-w-[48ch]">{article.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Reveal>

            <Reveal y={10} duration={0.5} className="mt-8">
              <p className="eyebrow">{CATEGORY_LABELS[lang][article.category]}</p>
            </Reveal>

            <h1 className="mt-4 max-w-[24ch] text-balance font-display text-[clamp(2.1rem,5.2vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.045em] text-foreground">
              <FlipWords
                baseDelay={0.1}
                stagger={0.05}
                key={article.id}
                words={article.title.split(/\s+/).map((text) => ({ text }))}
              />
            </h1>

            <Reveal delay={0.1} y={12}>
              <p className="mt-6 max-w-[40rem] text-pretty text-[18px] leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
            </Reveal>

            <Reveal delay={0.16} y={10}>
              <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[12.5px] text-muted-foreground">
                <li className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>
                    {t.by} <span className="text-foreground">{article.author_name}</span>
                    {article.author_role ? `, ${article.author_role}` : ""}
                  </span>
                </li>
                <li className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>
                    {t.published} <time dateTime={article.published_at}>{formatArticleDate(article.published_at, lang)}</time>
                  </span>
                </li>
                {showUpdated && article.modified_at ? (
                  <li className="inline-flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>
                      {t.updated} <time dateTime={article.modified_at}>{formatArticleDate(article.modified_at, lang)}</time>
                    </span>
                  </li>
                ) : null}
                <li className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                  {readingTimeLabel(article.reading_minutes, lang)}
                </li>
              </ul>
            </Reveal>
          </div>
        </header>

        <div className="shell grid gap-10 pb-6 pt-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16 lg:pt-10">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <div className="max-w-[44rem]">
              <ArticleContentView content={article.content} />

              <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                  {CATEGORY_LABELS[lang][article.category]}
                </p>
                <Button asChild variant="secondary">
                  <a href={linkedInShareUrl(article.slug)} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                    {t.share}
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <aside className="lg:col-start-2 lg:row-start-1">
            <ArticleToc items={toc} />
            <div className="mt-4 hidden lg:block">
              <Button asChild variant="secondary" className="w-full">
                <a href={linkedInShareUrl(article.slug)} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" aria-hidden="true" />
                  {t.share}
                </a>
              </Button>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="py-16 md:py-20">
          <div className="shell">
            <SectionHeading eyebrow={t.relatedEyebrow} title={<span id="related-title">{t.related}</span>} />
            <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <li key={item.id} className="list-none">
                  <ArticleCard article={item} index={index} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ArticleCta />
    </ResourcesLayout>
  );
}

function MissingArticle({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    <ResourcesLayout>
      <section className="shell py-24 text-center">
        <p className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-[-0.03em] text-foreground">{t.missing}</p>
        <Button asChild className="mt-8">
          <Link to="/ressources">{t.back}</Link>
        </Button>
      </section>
    </ResourcesLayout>
  );
}

const ArticlePage = () => {
  const { slug } = useParams();
  const state = useArticle(slug);
  const { articles } = useArticleList();

  if (state.status === "found") {
    return (
      <LangOverride lang={state.article.lang}>
        <ArticleView article={state.article} list={articles} />
      </LangOverride>
    );
  }

  if (state.status === "missing") {
    return <MissingArticleOrNotFound />;
  }

  return (
    <ResourcesLayout>
      <p className="shell py-24 text-center text-[15px] text-muted-foreground" role="status">
        …
      </p>
    </ResourcesLayout>
  );
};

/** Unknown slug: the same 404 page as the rest of the site, kept out of search indexes. */
function MissingArticleOrNotFound() {
  return <NotFound />;
}

export default ArticlePage;
