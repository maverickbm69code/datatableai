import { ChefHat, Euro, MessageSquareText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";

type WatchItem = { title: string; body: string; icon: LucideIcon };

const ITEMS: WatchItem[] = [
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

const INTRO =
  "DaTable ne réalise pas une simple étude de marché ponctuelle. Notre technologie assure une veille quotidienne de votre environnement concurrentiel pour vous aider à comprendre ce qui évolue autour de votre établissement.";
const PUBLIC_NOTE =
  "Une veille fondée sur des informations publiques : jamais sur les ventes ou les données privées de vos voisins.";

export function WatchSection() {
  return (
    <section id="veille" className="py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Veille concurrentielle quotidienne"
          title="Vos concurrents évoluent chaque jour. Gardez une longueur d'avance."
          description={INTRO}
        />

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {ITEMS.map((item, index) => {
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
              Ne regardez plus seulement vos chiffres. Comprenez aussi ce qui se passe autour de vous.
            </p>
            <p className="mt-3 max-w-[40rem] text-[13.5px] leading-relaxed text-muted-foreground">{PUBLIC_NOTE}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
