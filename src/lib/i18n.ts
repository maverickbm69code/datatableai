import { useSyncExternalStore } from "react";

export type Lang = "fr" | "en";

const STORAGE_KEY = "datable-lang";
const SITE_URL = "https://datableia.com";
const listeners = new Set<() => void>();

function isLang(value: unknown): value is Lang {
  return value === "fr" || value === "en";
}

/**
 * Picks the visitor's language, in order of priority:
 * 1. `?lang=en` / `?lang=fr` in the URL (shareable links),
 * 2. the choice saved from the language switcher,
 * 3. the browser's preferred languages (first French or English match),
 * 4. English for everyone else, since the site is French-first only for French speakers.
 * Search and AI crawlers always get French at "/" so the indexed page matches its
 * canonical URL; the English version is indexed separately at "/?lang=en".
 */
const CRAWLER_UA = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|chatgpt|perplexity|lighthouse/i;

function langFromUrl(): Lang | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang")?.toLowerCase();
    return isLang(fromUrl) ? fromUrl : null;
  } catch {
    return null;
  }
}

function detectLang(): Lang {
  if (typeof window === "undefined") return "fr";
  const fromUrl = langFromUrl();
  if (fromUrl) return fromUrl;
  if (CRAWLER_UA.test(navigator.userAgent ?? "")) return "fr";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* storage unavailable */
  }
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const base = tag?.toLowerCase().split("-")[0];
    if (isLang(base)) return base;
  }
  return "en";
}

let current: Lang = detectLang();

const META: Record<Lang, { title: string; description: string; locale: string }> = {
  fr: {
    title: "DaTable — Intelligence et rentabilité pour les restaurateurs",
    description:
      "Pilotez la rentabilité de votre restaurant avec DaTable : analyse des ventes, veille concurrentielle et plan d'action, entre IA et accompagnement humain.",
    locale: "fr_FR",
  },
  en: {
    title: "DaTable — Intelligence and profitability for restaurant owners",
    description:
      "Run a more profitable restaurant with DaTable: sales analytics, competitor monitoring and a clear action plan, combining AI with hands-on human support.",
    locale: "en_US",
  },
};

function applyDocument(lang: Lang) {
  if (typeof document === "undefined") return;
  const meta = META[lang];
  document.documentElement.lang = lang;
  document.title = meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", meta.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", meta.description);
  document.querySelector('meta[property="og:locale"]')?.setAttribute("content", meta.locale);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", meta.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", meta.description);
  // Only explicit "?lang=" URLs are self-canonical; "/" always points to itself.
  const url = langFromUrl() === "en" ? `${SITE_URL}/?lang=en` : `${SITE_URL}/`;
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", url);
}

applyDocument(current);

export function setLang(lang: Lang) {
  if (lang === current) return;
  current = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage unavailable */
  }
  applyDocument(lang);
  listeners.forEach((listener) => listener());
}

export function getLang(): Lang {
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, () => current, () => "fr");
}

/** Returns the copy for the active language from a `{ fr, en }` dictionary. */
export function useCopy<T>(copy: Record<Lang, T>): T {
  return copy[useLang()];
}

export const NUMBER_LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-US" };

/**
 * Money is shown with the same amounts in both languages, only the symbol changes:
 * "199 €" for French visitors, "$199" for US English visitors (no conversion).
 */
export function formatMoney(amount: number, lang: Lang, decimals = 0): string {
  const number = new Intl.NumberFormat(NUMBER_LOCALE[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  return lang === "en" ? `$${number}` : `${number} €`;
}
