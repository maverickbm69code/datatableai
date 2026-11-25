import { BarChart3, Store, Tag, Truck, Users, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { useCopy } from "@/lib/i18n";

type Card = { icon: LucideIcon; title: string; body: string };

const ICONS = [BarChart3, Users, Store, Tag, Truck, UtensilsCrossed];

const COPY = {
  fr: {
    eyebrow: "Le service",
    title: "Tout ce qui compte, au même endroit.",
    cards: [
      { title: "Chiffre d'affaires", body: "Par jour, par service, par plat." },
      { title: "Ventes par collaborateur", body: "Qui vend quoi, et où progresser." },
      { title: "Concurrence d'en face", body: "Ce qui bouge dans votre quartier." },
      { title: "Vos prix sur le marché", body: "Trop cher, pas assez : on compare." },
      { title: "Fournisseurs", body: "Les hausses repérées tout de suite." },
      { title: "Food cost et bev cost", body: "Vos marges suivies, plat par plat." },
    ],
  },
  en: {
    eyebrow: "The service",
    title: "Everything that matters, in one place.",
    cards: [
      { title: "Revenue", body: "By day, by shift, by dish." },
      { title: "Sales per staff member", body: "Who sells what, and where to improve." },
      { title: "The competition across the street", body: "What's changing in your area." },
      { title: "Your prices vs. the market", body: "Too high, too low: we compare." },
      { title: "Suppliers", body: "Price increases spotted right away." },
      { title: "Food cost & bev cost", body: "Your margins tracked, dish by dish." },
    ],
  },
};

export function ServiceSection() {
  const t = useCopy(COPY);
  const cards: Card[] = t.cards.map((card, i) => ({ ...card, icon: ICONS[i] }));
  return (
    <section id="service" className="scroll-mt-16 py-20 md:py-28">
      <div className="shell">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ icon: Icon, title, body }, index) => (
            <li key={title}>
              <Reveal delay={index * 0.06} y={16} className="h-full">
                <article className="card-surface group h-full p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-[19px] font-semibold tracking-[-0.02em] text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
