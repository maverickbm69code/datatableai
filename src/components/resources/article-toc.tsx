import { useEffect, useState } from "react";

import type { TocItem } from "@/lib/articles/content";
import { useCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const COPY = {
  fr: { title: "Sommaire", label: "Sommaire de l'article" },
  en: { title: "In this article", label: "Table of contents" },
};

/** Table of contents with anchor links; the section being read is highlighted. */
export function ArticleToc({ items }: { items: TocItem[] }) {
  const t = useCopy(COPY);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || items.length === 0) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = items.find((item) => visible.has(item.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    for (const item of items) {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label={t.label} className="card-surface p-5 lg:sticky lg:top-24">
      <p className="eyebrow">{t.title}</p>
      <ol className="mt-4 flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "true" : undefined}
              className={cn(
                "block rounded-sm border-l-2 py-1.5 pr-2 text-[14px] leading-snug transition-colors duration-200",
                item.level === 3 ? "pl-6" : "pl-3",
                active === item.id
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
