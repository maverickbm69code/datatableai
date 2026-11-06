import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { selectOffer } from "@/lib/selected-offer";

const PARAGRAPHS = [
  "DaTable n'est pas seulement un logiciel d'analyse de données.",
  "C'est un partenaire de terrain qui aide les restaurateurs à comprendre leurs performances, suivre quotidiennement leur concurrence locale et prendre de meilleures décisions.",
];
const TEAM_LINES = [
  "Notre intelligence artificielle fournit les analyses.",
  "Notre équipe apporte l'expérience, l'écoute et l'accompagnement humain.",
];

export function PromiseSection() {
  return (
    <section id="promesse" className="py-20 md:py-28">
      <div className="shell flex flex-col items-center text-center">
        <Reveal y={10} duration={0.5}>
          <p className="eyebrow">Notre promesse</p>
        </Reveal>
        <Reveal delay={0.06} y={14}>
          <h2 className="mt-4 max-w-[44rem] text-balance font-display text-[clamp(1.75rem,3.6vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.04em] text-foreground">
            Connaissez vos chiffres. Comprenez vos voisins. Prenez les bonnes décisions.
          </h2>
        </Reveal>
        <Reveal delay={0.12} y={12}>
          <div className="mt-6 max-w-[38rem] space-y-3 text-pretty text-[16.5px] leading-relaxed text-muted-foreground">
            {PARAGRAPHS.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="pt-2 text-foreground">
              {TEAM_LINES[0]} {TEAM_LINES[1]}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.18} y={12} className="mt-9">
          <Button asChild size="lg">
            <a href="#diagnostic" onClick={() => selectOffer(null)}>
              Découvrir DaTable
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
