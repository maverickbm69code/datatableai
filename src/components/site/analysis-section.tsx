import { BadgeCheck, NotebookText, Users, Wine } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";

type AnalysisCard = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const CARDS: AnalysisCard[] = [
  {
    icon: Wine,
    title: "Plus de CA par couvert",
    body: "Boissons, cafés, desserts.",
  },
  {
    icon: Users,
    title: "Une équipe qui progresse",
    body: "Chaque serveur comparé aux meilleurs de la maison.",
  },
  {
    icon: NotebookText,
    title: "Une carte qui rapporte",
    body: "Plats porteurs, plats qui ne se vendent pas, vins qui dorment en cave.",
  },
  {
    icon: BadgeCheck,
    title: "Des chiffres fiables",
    body: "Erreurs de paramétrage de caisse repérées.",
  },
];

export function AnalysisSection() {
  return (
    <section id="analyse" className="py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Ce qu'on analyse"
          title="Des actions concrètes, chacune avec son gain en euros."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={index * 0.08} y={18}>
                <article className="card-surface h-full p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover md:p-8">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-primary-soft-strong bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-[19px] font-semibold leading-snug tracking-[-0.02em] text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-[15.5px] leading-relaxed text-muted-foreground">{card.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
