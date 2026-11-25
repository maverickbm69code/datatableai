import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { FlipWords } from "@/components/motion/flip-words";
import { Reveal } from "@/components/motion/reveal";
import { RevealWords } from "@/components/motion/reveal-words";
import { HeroTickets } from "@/components/site/hero-tickets";
import { LeadForm } from "@/components/site/lead-form";
import { useCopy } from "@/lib/i18n";
import { EASE_OUT, REVEAL_VIEWPORT } from "@/lib/motion";

const COPY = {
  fr: {
    eyebrow: "DaTable · Le copilote de votre restaurant",
    words: [
      { text: "Un" },
      { text: "copilote" },
      { text: "pour" },
      { text: "piloter" },
      { text: "votre", accent: true },
      { text: "restaurant.", accent: true },
    ],
    lead: "Chiffre d'affaires, ventes par collaborateur, concurrence du quartier, food cost : DaTable lit toute votre data et vous dit chaque jour quoi faire pour gagner plus.",
    promises: ["1er mois offert", "Rien à installer", "Une visite par mois"],
  },
  en: {
    eyebrow: "DaTable · Your restaurant's copilot",
    words: [
      { text: "A" },
      { text: "copilot" },
      { text: "to" },
      { text: "run" },
      { text: "your", accent: true },
      { text: "restaurant.", accent: true },
    ],
    lead: "Revenue, sales per staff member, local competition, food cost: DaTable reads all your data and tells you every day what to do to earn more.",
    promises: ["First month free", "Nothing to install", "One visit a month"],
  },
};

/** Same look and fade-in as the former eyebrow paragraph, as an inline element valid inside the H1. */
function EyebrowLine({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const className = "eyebrow block leading-normal";
  if (reduced) return <span className={className}>{text}</span>;
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      {text}
    </motion.span>
  );
}

export function HeroSection() {
  const t = useCopy(COPY);
  return (
    <section id="hero" className="hero-glow relative overflow-hidden">
      <div className="shell grid items-center gap-14 py-14 md:py-20 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-20">
        <div>
          {/* The eyebrow line is part of the H1 so the visible heading names the brand. */}
          <h1 className="text-balance font-display text-[clamp(2.5rem,7vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.045em] text-foreground">
            <EyebrowLine text={t.eyebrow} />
            <span className="mt-5 block">
              <FlipWords
                baseDelay={0.15}
                key={t.eyebrow}
                words={t.words}
              />
            </span>
          </h1>

          <RevealWords
            className="mt-6 max-w-[34rem] text-pretty text-[16.5px] leading-relaxed text-foreground"
            text={t.lead}
          />

          <Reveal delay={0.28} y={12}>
            <div id="contact" className="scroll-mt-24"><LeadForm source="hero" className="mt-9" /></div>
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
