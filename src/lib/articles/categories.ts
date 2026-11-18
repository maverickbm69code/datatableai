// Categories and topic icons of the « Ressources & Conseils » section.
// The keys are stored in the database (datable_articles.category) and are mirrored
// in supabase/functions/admin-articles/index.ts: keep both lists identical.
import {
  BarChart3,
  BookOpenText,
  BrainCircuit,
  ChefHat,
  Coins,
  Gauge,
  Handshake,
  Lightbulb,
  LineChart,
  PieChart,
  Receipt,
  Sparkles,
  Target,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import type { Lang } from "@/lib/i18n";

export const CATEGORY_KEYS = [
  "rentabilite",
  "pilotage",
  "data-ia",
  "menu-engineering",
  "cas-clients",
  "conseils",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];
export type CategoryFilter = CategoryKey | "all";

export const CATEGORY_LABELS: Record<Lang, Record<CategoryFilter, string>> = {
  fr: {
    all: "Tous les articles",
    rentabilite: "Rentabilité",
    pilotage: "Pilotage & Gestion",
    "data-ia": "Data & Intelligence artificielle",
    "menu-engineering": "Menu engineering",
    "cas-clients": "Cas clients",
    conseils: "Conseils pratiques",
  },
  en: {
    all: "All articles",
    rentabilite: "Profitability",
    pilotage: "Management & Operations",
    "data-ia": "Data & Artificial Intelligence",
    "menu-engineering": "Menu engineering",
    "cas-clients": "Case studies",
    conseils: "Practical tips",
  },
};

export function isCategoryKey(value: unknown): value is CategoryKey {
  return typeof value === "string" && (CATEGORY_KEYS as readonly string[]).includes(value);
}

/** Vector icons only: no photo, no cover image anywhere in the section. */
export const ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  "trending-up": { icon: TrendingUp, label: "Croissance" },
  coins: { icon: Coins, label: "Marges" },
  receipt: { icon: Receipt, label: "Ticket de caisse" },
  gauge: { icon: Gauge, label: "Pilotage" },
  target: { icon: Target, label: "Objectifs" },
  "bar-chart": { icon: BarChart3, label: "Graphique en barres" },
  "line-chart": { icon: LineChart, label: "Courbe" },
  "pie-chart": { icon: PieChart, label: "Répartition" },
  "brain-circuit": { icon: BrainCircuit, label: "Intelligence artificielle" },
  sparkles: { icon: Sparkles, label: "Analyse" },
  "utensils-crossed": { icon: UtensilsCrossed, label: "Carte et plats" },
  "chef-hat": { icon: ChefHat, label: "Cuisine" },
  handshake: { icon: Handshake, label: "Cas client" },
  lightbulb: { icon: Lightbulb, label: "Conseil" },
  "book-open": { icon: BookOpenText, label: "Guide" },
};

export const ICON_KEYS = Object.keys(ICONS);

export const DEFAULT_ICON_BY_CATEGORY: Record<CategoryKey, string> = {
  rentabilite: "trending-up",
  pilotage: "gauge",
  "data-ia": "brain-circuit",
  "menu-engineering": "utensils-crossed",
  "cas-clients": "handshake",
  conseils: "lightbulb",
};

export function resolveIcon(icon: string | null | undefined, category: CategoryKey): LucideIcon {
  const key = icon && ICONS[icon] ? icon : DEFAULT_ICON_BY_CATEGORY[category];
  return ICONS[key].icon;
}
