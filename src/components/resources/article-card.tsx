import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, resolveIcon } from "@/lib/articles/categories";
import { formatArticleDate, readingTimeLabel } from "@/lib/articles/format";
import type { ArticleSummary } from "@/lib/articles/types";
import { useLang } from "@/lib/i18n";
import { EASE_OUT } from "@/lib/motion";

const READ = { fr: "Lire l'article", en: "Read the article" };

type ArticleCardProps = {
  article: ArticleSummary;
  index?: number;
  /** Shown when the article is not in the language of the interface. */
  showLanguage?: boolean;
};

/** Same card as the offers section: spotlight on hover, top bar, icon that tilts, arrow that slides in. */
export function ArticleCard({ article, index = 0, showLanguage = false }: ArticleCardProps) {
  const lang = useLang();
  const reduced = useReducedMotion();
  const Icon = resolveIcon(article.icon, article.category);
  const cardLang = article.lang;

  function handleMove(event: MouseEvent<HTMLElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
  }

  return (
    <motion.article
      onMouseMove={handleMove}
      initial={reduced ? false : { opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.2 }}
      whileHover={reduced ? undefined : { y: -8, transition: { type: "spring", stiffness: 320, damping: 22 } }}
      transition={{ duration: 0.7, delay: Math.min(index, 8) * 0.09, ease: EASE_OUT }}
      className="card-surface group relative flex h-full flex-col overflow-hidden p-7 transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-card-hover"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-primary transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(280px circle at var(--mx, 50%) var(--my, 0%), hsl(var(--primary) / 0.11), transparent 70%)",
        }}
      />

      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          {showLanguage ? (
            <span className="rounded-sm border border-border px-2 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {cardLang}
            </span>
          ) : null}
        </div>

        <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
          {CATEGORY_LABELS[cardLang][article.category]}
        </p>
        <h3 className="mt-2 font-display text-[20px] font-semibold leading-snug tracking-[-0.02em] text-foreground">
          {article.title}
        </h3>
        <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-muted-foreground">{article.excerpt}</p>

        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={article.published_at}>{formatArticleDate(article.published_at, cardLang)}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {readingTimeLabel(article.reading_minutes, cardLang)}
          </span>
        </p>

        <hr className="my-6 border-0 border-t border-border" />

        <Button
          asChild
          variant="secondary"
          className="w-full group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <Link
            to={`/ressources/${article.slug}`}
            lang={cardLang !== lang ? cardLang : undefined}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {READ[cardLang]}
            <span className="sr-only">
              {" : "}
              {article.title}
            </span>
            <ArrowRight
              className="h-4 w-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:w-4 group-hover:translate-x-0 group-hover:opacity-100"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}
