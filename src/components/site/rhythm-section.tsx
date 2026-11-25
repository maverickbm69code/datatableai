import { motion, useReducedMotion } from "framer-motion";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { useCopy } from "@/lib/i18n";
import { EASE_OUT, REVEAL_VIEWPORT } from "@/lib/motion";

const COPY = {
  fr: {
    eyebrow: "Le rythme",
    title: "Simple, régulier, sans effort.",
    steps: [
      { when: "Chaque jour", title: "Un message", body: "Les chiffres de la veille, et quoi faire." },
      { when: "Chaque mois", title: "Un rapport complet", body: "Le bilan du mois, en clair." },
      { when: "Une fois par mois", title: "Une visite sur place", body: "On en parle ensemble, chez vous." },
    ],
  },
  en: {
    eyebrow: "The rhythm",
    title: "Simple, steady, effortless.",
    steps: [
      { when: "Every day", title: "A message", body: "Yesterday's numbers, and what to do." },
      { when: "Every month", title: "A full report", body: "The month in review, plainly." },
      { when: "Once a month", title: "An on-site visit", body: "We talk it through, at your place." },
    ],
  },
};

/** Hand-drawn stroke that draws itself above each step. */
function Stroke({ delay }: { delay: number }) {
  const reduced = useReducedMotion();
  return (
    <svg width="120" height="14" viewBox="0 0 120 14" aria-hidden="true" className="mb-6 block">
      <motion.path
        d="M2 9C22 3 40 12 60 7S100 3 118 8"
        fill="none"
        className="stroke-primary"
        strokeWidth={2}
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ duration: 0.7, delay, ease: EASE_OUT }}
      />
    </svg>
  );
}

export function RhythmSection() {
  const t = useCopy(COPY);
  return (
    <section id="rythme" className="scroll-mt-16 py-20 md:py-28">
      <div className="shell">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} />
        <ol className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-10">
          {t.steps.map((step, index) => (
            <li key={step.when}>
              <Reveal delay={index * 0.12} y={16}>
                <Stroke delay={index * 0.14} />
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                  {step.when}
                </p>
                <h3 className="mt-3 font-display text-[22px] font-semibold leading-snug tracking-[-0.02em] text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[34ch] text-[15.5px] leading-relaxed text-muted-foreground">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
