import { motion, useReducedMotion } from "framer-motion";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { useCopy } from "@/lib/i18n";
import { EASE_OUT, REVEAL_VIEWPORT } from "@/lib/motion";

type Step = {
  index: string;
  title: string;
  body: string;
};

const STEPS_FR: Step[] = [
  {
    index: "01",
    title: "Vous exportez",
    body: "Un mois de ventes depuis votre caisse. Aucune installation, aucun accès à votre logiciel.",
  },
  {
    index: "02",
    title: "On analyse",
    body: "Vos chiffres comparés à vos meilleurs services et aux restaurants de votre marché.",
  },
  {
    index: "03",
    title: "On vous restitue",
    body: "Un rapport clair et 30 minutes ensemble : quoi faire, sur quelle base, combien ça rapporte.",
  },
];

const STEPS_EN: Step[] = [
  {
    index: "01",
    title: "You export",
    body: "One month of sales data from your POS. Nothing to install, and we never need access to your system.",
  },
  {
    index: "02",
    title: "We analyze",
    body: "Your numbers benchmarked against your own best shifts and against restaurants in your market.",
  },
  {
    index: "03",
    title: "We walk you through it",
    body: "A clear report and a 30-minute sit-down: what to do, why, and how much it's worth to you.",
  },
];

const COPY = {
  fr: {
    steps: STEPS_FR,
    eyebrow: "Comment ça marche",
    title: "Dix minutes de votre temps, un plan d'action en une semaine.",
  },
  en: {
    steps: STEPS_EN,
    eyebrow: "How it works",
    title: "Ten minutes of your time. An action plan within a week.",
  },
};

/** Hand-drawn stroke that draws itself above each step. */
function StepStroke({ delay }: { delay: number }) {
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

export function StepsSection() {
  const t = useCopy(COPY);
  return (
    <section id="fonctionnement" className="py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
        />

        <ol className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-10">
          {t.steps.map((step, index) => (
            <li key={step.index}>
              <Reveal delay={index * 0.12} y={16}>
                <StepStroke delay={index * 0.14} />
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                  {step.index}
                </p>
                <h3 className="mt-3 font-display text-[22px] font-semibold leading-snug tracking-[-0.02em] text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[34ch] text-[15.5px] leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
