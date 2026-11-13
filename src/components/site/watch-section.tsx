import { ChefHat, Euro, MessageSquareText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { useCopy } from "@/lib/i18n";

type WatchItem = { title: string; body: string; icon: LucideIcon };

const ITEMS_FR: WatchItem[] = [
  {
    title: "Nouveaux produits et nouvelles offres",
    body: "Découvrez les nouveaux plats, produits, formules et promotions proposés par les établissements voisins.",
    icon: ChefHat,
  },
  {
    title: "Évolution des prix",
    body: "Suivez les modifications de tarifs et le positionnement commercial de vos concurrents proches.",
    icon: Euro,
  },
  {
    title: "Tendances et avis clients",
    body: "Identifiez les tendances émergentes, les avis publics et les nouvelles attentes exprimées par les consommateurs.",
    icon: MessageSquareText,
  },
];

const ITEMS_EN: WatchItem[] = [
  {
    title: "New products and offers",
    body: "See the new dishes, products, set menus and promotions launched by nearby restaurants.",
    icon: ChefHat,
  },
  {
    title: "Price changes",
    body: "Track pricing changes and the market positioning of your closest competitors.",
    icon: Euro,
  },
  {
    title: "Trends and customer reviews",
    body: "Spot emerging trends, public reviews and the new expectations customers are voicing.",
    icon: MessageSquareText,
  },
];

const INTRO_FR =
  "DaTable ne réalise pas une simple étude de marché ponctuelle. Notre technologie assure une veille quotidienne de votre environnement concurrentiel pour vous aider à comprendre ce qui évolue autour de votre établissement.";
const PUBLIC_NOTE_FR =
  "Une veille fondée sur des informations publiques : jamais sur les ventes ou les données privées de vos voisins.";

const COPY = {
  fr: {
    items: ITEMS_FR,
    eyebrow: "Veille concurrentielle quotidienne",
    title: "Vos concurrents évoluent chaque jour. Gardez une longueur d'avance.",
    intro: INTRO_FR,
    quote: "Ne regardez plus seulement vos chiffres. Comprenez aussi ce qui se passe autour de vous.",
    note: PUBLIC_NOTE_FR,
  },
  en: {
    items: ITEMS_EN,
    eyebrow: "Daily competitor monitoring",
    title: "Your competitors change every day. Stay one step ahead.",
    intro:
      "DaTable doesn't run a one-off market study. Our technology monitors your competitive landscape every day, so you understand what's changing around your restaurant.",
    quote: "Don't just look at your own numbers. Understand what's happening around you, too.",
    note: "Monitoring based on public information only: never on your neighbors' sales or private data.",
  },
};

export function WatchSection() {
  const t = useCopy(COPY);
  return (
    <section id="veille" className="py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.intro}
        />

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {t.items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 0.08} y={16}>
                <li className="card-surface flex h-full list-none flex-col p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-[18px] font-semibold leading-snug tracking-[-0.02em] text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
                </li>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={0.1} y={14} className="mt-12">
          <div className="border-l-2 border-primary pl-6 md:pl-8">
            <p className="max-w-[40rem] text-balance font-display text-[clamp(1.25rem,2.4vw,1.7rem)] font-semibold leading-snug tracking-[-0.03em] text-foreground">
              {t.quote}
            </p>
            <p className="mt-3 max-w-[40rem] text-[13.5px] leading-relaxed text-muted-foreground">{t.note}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
