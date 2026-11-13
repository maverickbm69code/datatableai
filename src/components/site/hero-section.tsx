import { Check } from "lucide-react";

import { FlipWords } from "@/components/motion/flip-words";
import { Reveal } from "@/components/motion/reveal";
import { RevealWords } from "@/components/motion/reveal-words";
import { HeroTickets } from "@/components/site/hero-tickets";
import { LeadForm } from "@/components/site/lead-form";
import { useCopy } from "@/lib/i18n";

const COPY = {
  fr: {
    eyebrow: "Analyse du chiffre d'affaires des restaurants",
    words: [
      { text: "L’argent" },
      { text: "est" },
      { text: "déjà" },
      { text: "dans" },
      { text: "votre", accent: true },
      { text: "caisse.", accent: true },
    ],
    lead: "Datable analyse vos ventes de caisse et vous dit, en euros, comment augmenter votre chiffre d'affaires. Puis on suit les résultats avec vous, chaque mois.",
    promises: ["1er mois offert", "Aucune installation", "Visite mensuelle incluse"],
  },
  en: {
    eyebrow: "Sales analytics for restaurants",
    words: [
      { text: "The" },
      { text: "money's" },
      { text: "already" },
      { text: "in" },
      { text: "your", accent: true },
      { text: "register.", accent: true },
    ],
    lead: "Datable analyzes your POS sales and shows you, in dollars, exactly how to grow your top line. Then we track the results with you, month after month.",
    promises: ["First month free", "Nothing to install", "Monthly on-site visit included"],
  },
};

export function HeroSection() {
  const t = useCopy(COPY);
  return (
    <section id="hero" className="hero-glow relative overflow-hidden">
      <div className="shell grid items-center gap-14 py-14 md:py-20 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-20">
        <div>
          <Reveal y={10} duration={0.5}>
            <p className="eyebrow">{t.eyebrow}</p>
          </Reveal>

          <h1 className="mt-5 text-balance font-display text-[clamp(2.5rem,7vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.045em] text-foreground">
            <FlipWords
              baseDelay={0.15}
              key={t.eyebrow}
              words={t.words}
            />
          </h1>

          <RevealWords
            className="mt-6 max-w-[34rem] text-pretty text-[16.5px] leading-relaxed text-foreground"
            text={t.lead}
          />

          <Reveal delay={0.28} y={12}>
            <LeadForm source="hero" className="mt-9" />
          </Reveal>

          <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
            {t.promises.map((promise, index) => (
              <li key={promise}>
                <Reveal delay={0.36 + index * 0.08} y={8}>
                  <span className="flex items-center gap-2 text-[14.5px] text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {promise}
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.3} y={20} className="lg:justify-self-end">
          <HeroTickets />
        </Reveal>
      </div>
    </section>
  );
}
