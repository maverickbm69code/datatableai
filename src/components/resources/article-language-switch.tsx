import { Link } from "react-router-dom";

import type { ArticleSummary } from "@/lib/articles/types";
import type { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Lang; label: string; name: string }[] = [
  { value: "fr", label: "FR", name: "Français" },
  { value: "en", label: "EN", name: "English" },
];

const NO_TRANSLATION = {
  fr: "Cet article n'existe pas en français",
  en: "This article is not available in English",
};

/**
 * FR / EN switch of an article page. Same look as the site's language switcher, but a language
 * is only a link when a published translation really exists: nothing is translated automatically.
 */
export function ArticleLanguageSwitch({
  lang,
  translation,
}: {
  lang: Lang;
  translation: ArticleSummary | null;
}) {
  return (
    <div
      role="group"
      aria-label={lang === "fr" ? "Langue de l'article" : "Article language"}
      className="inline-flex items-center rounded-sm border border-border p-0.5"
    >
      {OPTIONS.map((option) => {
        const base =
          "inline-flex h-8 min-w-[2.25rem] items-center justify-center rounded-[3px] px-2 font-mono text-[11.5px] font-medium tracking-[0.08em] transition-colors duration-200";
        if (option.value === lang) {
          return (
            <span key={option.value} lang={option.value} aria-current="true" title={option.name} className={cn(base, "bg-primary text-primary-foreground")}>
              {option.label}
            </span>
          );
        }
        if (translation && translation.lang === option.value) {
          return (
            <Link
              key={option.value}
              lang={option.value}
              hrefLang={option.value}
              to={`/ressources/${translation.slug}`}
              aria-label={option.name}
              className={cn(base, "text-muted-foreground hover:text-foreground")}
            >
              {option.label}
            </Link>
          );
        }
        return (
          <span
            key={option.value}
            lang={option.value}
            aria-disabled="true"
            title={NO_TRANSLATION[option.value]}
            className={cn(base, "cursor-not-allowed text-muted-foreground/40")}
          >
            {option.label}
          </span>
        );
      })}
    </div>
  );
}
