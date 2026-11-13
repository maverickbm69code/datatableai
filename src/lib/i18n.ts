import { useSyncExternalStore } from "react";

export type Lang = "fr" | "en";

const STORAGE_KEY = "datable-lang";
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
 */
function detectLang(): Lang {
  if (typeof window === "undefined") return "fr";
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang")?.toLowerCase();
    if (isLang(fromUrl)) return fromUrl;
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
    title: "Datable | Analyse de caisse pour restaurants",
    description:
      "Datable analyse les ventes de caisse des restaurants et en tire un plan d'action chiffré en euros. Premier mois offert.",
    locale: "fr_FR",
  },
  en: {
    title: "Datable | POS sales analysis for restaurants",
    description:
      "Datable analyzes your restaurant's POS sales and turns them into an action plan with the gain for each move. First month free.",
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
