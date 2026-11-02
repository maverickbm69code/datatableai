import { motion, useReducedMotion } from "framer-motion";

import { FlipWords } from "@/components/motion/flip-words";
import { Reveal } from "@/components/motion/reveal";
import { ComparisonChart } from "@/components/site/comparison-chart";
import { EASE_OUT } from "@/lib/motion";

type Point = {
  title: string;
  body: string;
};

const POINTS: Point[] = [
  {
    title: "De vraies analyses",
    body: "3 058 tickets et 7 747 couverts passés au crible en un mois.",
  },
  {
    title: "Plus de 30 restaurants",
    body: "Un portefeuille déjà en place pour des comparaisons solides dès le premier mois.",
  },
  {
    title: "Toujours anonyme",
    body: "Vous voyez où vous vous situez, jamais le nom des autres.",
  },
];

export function DarkBandSection() {
  const reduced = useReducedMotion();

  return (
    <section id="preuve" className="py-16 md:py-24">
      <motion.div
        className="band-surface"
        initial={reduced ? false : { clipPath: "inset(0% 5% 0% 5%)", borderRadius: 36, opacity: 0.6 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)", borderRadius: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.75, ease: EASE_OUT }}
      >
        <div className="shell grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div>
            <h2 className="text-balance font-display text-[clamp(1.85rem,3.8vw,2.75rem)] font-bold leading-[1.06] tracking-[-0.04em] text-band-foreground">
              <FlipWords
                baseDelay={0.15}
                words={[
                  { text: "Faites" },
                  { text: "mieux" },
                  { text: "que" },
                  { text: "vos", accent: true },
                  { text: "concurrents.", accent: true },
                ]}
                accentClassName="text-primary-on-band"
              />
            </h2>

            <ul className="mt-10 flex flex-col">
              {POINTS.map((point, index) => (
                <Reveal key={point.title} delay={0.2 + index * 0.09} y={14}>
                  <li className="border-t border-band-border py-6 last:border-b">
                    <div className="flex gap-5">
                      <span className="mt-0.5 font-mono text-[11px] font-medium tracking-[0.12em] text-primary-on-band">
                        {`0${index + 1}`}
                      </span>
                      <div>
                        <h3 className="font-display text-[17.5px] font-semibold tracking-[-0.02em] text-band-foreground">
                          {point.title}
                        </h3>
                        <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-band-muted">
                          {point.body}
                        </p>
                      </div>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal delay={0.24} y={18} className="lg:justify-self-end lg:self-center">
            <ComparisonChart className="w-full" />
          </Reveal>
        </div>
      </motion.div>
    </section>
  );
}
