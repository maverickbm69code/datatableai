import { LayoutGroup, motion, useReducedMotion } from "framer-motion";

import { CATEGORY_KEYS, CATEGORY_LABELS, type CategoryFilter } from "@/lib/articles/categories";
import { useLang } from "@/lib/i18n";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type CategoryFilterBarProps = {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
  counts: Record<CategoryFilter, number>;
};

const KEYS: CategoryFilter[] = ["all", ...CATEGORY_KEYS];

/** Same segmented-control look as the FR / EN switcher; the active pill glides between choices. */
export function CategoryFilterBar({ value, onChange, counts }: CategoryFilterBarProps) {
  const lang = useLang();
  const reduced = useReducedMotion();

  return (
    <LayoutGroup id="resources-filter">
      <div
        role="group"
        aria-label={lang === "fr" ? "Filtrer les articles par catégorie" : "Filter articles by category"}
        className="flex flex-wrap gap-2"
      >
        {KEYS.map((key) => {
          const active = key === value;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={active}
              className={cn(
                "relative inline-flex h-10 items-center gap-2 rounded-sm border px-3.5 text-[13.5px] font-medium transition-colors duration-200",
                active
                  ? "border-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground shadow-card hover:border-border-strong hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="resources-filter-pill"
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[7px] bg-primary shadow-card"
                  transition={reduced ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT }}
                />
              ) : null}
              <span className="relative">{CATEGORY_LABELS[lang][key]}</span>
              <span
                className={cn(
                  "relative font-mono text-[11px] tnum",
                  active ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
