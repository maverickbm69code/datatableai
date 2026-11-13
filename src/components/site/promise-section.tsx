import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/lib/i18n";
import { selectOffer } from "@/lib/selected-offer";

const COPY = {
  fr: {
    eyebrow: "Notre promesse",
    title: "Connaissez vos chiffres. Comprenez vos voisins. Prenez les bonnes décisions.",
    paragraphs: [
      "DaTable n'est pas seulement un logiciel d'analyse de données.",
      "C'est un partenaire de terrain qui aide les restaurateurs à comprendre leurs performances, suivre quotidiennement leur concurrence locale et prendre de meilleures décisions.",
    ],
    team: [
      "Notre intelligence artificielle fournit les analyses.",
      "Notre équipe apporte l'expérience, l'écoute et l'accompagnement humain.",
    ],
    cta: "Découvrir DaTable",
  },
  en: {
    eyebrow: "Our promise",
    title: "Know your numbers. Understand your neighbors. Make the right calls.",
    paragraphs: [
      "DaTable is more than data analysis software.",
      "It's a hands-on partner that helps restaurant owners understand their performance, keep a daily eye on local competitors and make better decisions.",
    ],
    team: [
      "Our artificial intelligence delivers the analysis.",
      "Our team brings experience, a listening ear and real human support.",
    ],
    cta: "Discover DaTable",
  },
};

export function PromiseSection() {
  const t = useCopy(COPY);
  return (
    <section id="promesse" className="py-20 md:py-28">
      <div className="shell flex flex-col items-center text-center">
        <Reveal y={10} duration={0.5}>
          <p className="eyebrow">{t.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.06} y={14}>
          <h2 className="mt-4 max-w-[44rem] text-balance font-display text-[clamp(1.75rem,3.6vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.04em] text-foreground">
            {t.title}
          </h2>
        </Reveal>
        <Reveal delay={0.12} y={12}>
          <div className="mt-6 max-w-[38rem] space-y-3 text-pretty text-[16.5px] leading-relaxed text-muted-foreground">
            {t.paragraphs.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="pt-2 text-foreground">
              {t.team[0]} {t.team[1]}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.18} y={12} className="mt-9">
          <Button asChild size="lg">
            <a href="#diagnostic" onClick={() => selectOffer(null)}>
              {t.cta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
