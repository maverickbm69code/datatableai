import { NUMBER_LOCALE, type Lang } from "@/lib/i18n";

/** "18 novembre 2026" / "November 18, 2026". Always Paris time so server and browser agree. */
export function formatArticleDate(value: string, lang: Lang): string {
  return new Intl.DateTimeFormat(NUMBER_LOCALE[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
}

export function readingTimeLabel(minutes: number, lang: Lang): string {
  return lang === "fr" ? `${minutes} min de lecture` : `${minutes} min read`;
}
