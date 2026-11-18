import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { FlipWords } from "@/components/motion/flip-words";
import { Reveal } from "@/components/motion/reveal";
import { RevealWords } from "@/components/motion/reveal-words";
import { ArticleCard } from "@/components/resources/article-card";
import { ArticleCta } from "@/components/resources/article-cta";
import { CategoryFilterBar } from "@/components/resources/category-filter";
import { ResourcesLayout } from "@/components/resources/resources-layout";
import { CutleryDivider } from "@/components/site/cutlery-divider";
import { CATEGORY_KEYS, type CategoryFilter } from "@/lib/articles/categories";
import { listingHead } from "@/lib/articles/seo";
import { useArticleList } from "@/lib/articles/use-articles";
import { useCopy, useLang } from "@/lib/i18n";
import { usePageHead } from "@/lib/page-meta";

const COPY = {
  fr: {
    eyebrow: "L'EXPERTISE DATABLE",
    words: [
      { text: "Pilotez" },
      { text: "mieux." },
      { text: "Rentabilisez", accent: true },
      { text: "plus.", accent: true },
    ],
    lead: "Des conseils concrets, des analyses et des ressources pour transformer les données de votre restaurant en opportunités.",
    empty: "Les premiers articles arrivent bientôt.",
    emptyHint: "En attendant, découvrez comment DaTable transforme vos données de caisse en plan d'action chiffré.",
    emptyCategory: "Aucun article dans cette catégorie pour le moment.",
    otherLanguage: "Les articles ne sont pas encore disponibles dans cette langue. Voici ceux publiés en français.",
    resultsOne: "article affiché",
    resultsMany: "articles affichés",
  },
  en: {
    eyebrow: "THE DATABLE EXPERTISE",
    words: [
      { text: "Run" },
      { text: "it" },
      { text: "better." },
      { text: "Earn", accent: true },
      { text: "more.", accent: true },
    ],
    lead: "Practical advice, analysis and resources to turn your restaurant's data into opportunities.",
    empty: "The first articles are coming soon.",
    emptyHint: "In the meantime, see how DaTable turns your POS data into a quantified action plan.",
    emptyCategory: "No articles in this category yet.",
    otherLanguage: "Articles are not available in this language yet. Here are the ones published in French.",
    resultsOne: "article shown",
    resultsMany: "articles shown",
  },
};

const ResourcesPage = () => {
  const lang = useLang();
  const t = useCopy(COPY);
  const reduced = useReducedMotion();
  const { articles, loading } = useArticleList();
  const [category, setCategory] = useState<CategoryFilter>("all");

  usePageHead(listingHead(lang, articles));

  // Articles in the interface language. If there are none but others exist, show those instead.
  const inLanguage = useMemo(() => articles.filter((article) => article.lang === lang), [articles, lang]);
  const fallback = inLanguage.length === 0 && articles.length > 0;
  const pool = fallback ? articles : inLanguage;

  const counts = useMemo(() => {
    const result = { all: pool.length } as Record<CategoryFilter, number>;
    for (const key of CATEGORY_KEYS) result[key] = pool.filter((article) => article.category === key).length;
    return result;
  }, [pool]);

  const shown = category === "all" ? pool : pool.filter((article) => article.category === category);

  return (
    <ResourcesLayout>
      <section className="hero-glow relative overflow-hidden">
        <div className="shell py-14 md:py-20">
          <Reveal y={10} duration={0.5}>
            <p className="eyebrow">{t.eyebrow}</p>
          </Reveal>

          <h1 className="mt-5 max-w-[16ch] text-balance font-display text-[clamp(2.5rem,7vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.045em] text-foreground sm:max-w-none">
            <FlipWords baseDelay={0.15} key={t.eyebrow} words={t.words} />
          </h1>

          <RevealWords
            className="mt-6 max-w-[38rem] text-pretty text-[16.5px] leading-relaxed text-foreground"
            text={t.lead}
          />
        </div>
      </section>

      <section aria-label={lang === "fr" ? "Articles" : "Articles"} className="pb-16 pt-4 md:pb-24">
        <div className="shell">
          <Reveal y={12}>
            <CategoryFilterBar value={category} onChange={setCategory} counts={counts} />
          </Reveal>

          <p className="sr-only" aria-live="polite">
            {shown.length} {shown.length === 1 ? t.resultsOne : t.resultsMany}
          </p>

          {fallback ? (
            <p className="mt-6 rounded-md border border-border bg-primary-soft px-4 py-3 text-[14px] text-foreground">
              {t.otherLanguage}
            </p>
          ) : null}

          {loading ? (
            <ul aria-hidden="true" className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <li key={item} className="card-surface h-[22rem] animate-pulse" />
              ))}
            </ul>
          ) : shown.length > 0 ? (
            <motion.ul layout={!reduced} className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout" initial>
                {shown.map((article, index) => (
                  <motion.li
                    key={article.id}
                    layout={!reduced}
                    exit={reduced ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                    className="list-none"
                  >
                    <ArticleCard article={article} index={index} showLanguage={fallback || article.lang !== lang} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <Reveal y={12} className="mt-10">
              <div className="card-surface px-6 py-14 text-center">
                <p className="font-display text-[clamp(1.25rem,2.4vw,1.6rem)] font-semibold tracking-[-0.025em] text-foreground">
                  {articles.length === 0 ? t.empty : t.emptyCategory}
                </p>
                {articles.length === 0 ? (
                  <p className="mx-auto mt-3 max-w-[34rem] text-[15.5px] leading-relaxed text-muted-foreground">
                    {t.emptyHint}
                  </p>
                ) : null}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <CutleryDivider />
      <ArticleCta />
    </ResourcesLayout>
  );
};

export default ResourcesPage;
