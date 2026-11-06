import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";

const INTRO =
  "Chez DaTable, nous sommes convaincus que la technologie ne remplacera jamais la compréhension du terrain et le contact humain.";
const VISIT_LEAD = "C'est pourquoi nous venons vous rencontrer";
const VISIT_STRONG = "au minimum une fois par mois, directement dans votre établissement.";
const VISIT_INTRO = "Ces rendez-vous permettent de :";
const OUTRO =
  "Notre objectif n'est pas simplement de vous fournir des chiffres, mais de vous accompagner durablement dans la réussite de votre établissement.";
const CLOSING = "L'IA observe et analyse. Ensemble, nous décidons.";

const MEETINGS = [
  "Comprendre votre quotidien et vos problématiques.",
  "Analyser ensemble vos performances.",
  "Faire le point sur les évolutions de votre concurrence.",
  "Identifier les actions prioritaires pour améliorer votre rentabilité.",
  "Suivre les résultats des décisions prises les mois précédents.",
];

export function HumanSection() {
  return (
    <section id="accompagnement" className="py-16 md:py-24">
      <div className="band-surface">
        <div className="shell grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-20">
          <div>
            <SectionHeading
              tone="band"
              eyebrow="L'humain au cœur de DaTable"
              title="L'intelligence artificielle analyse. L'humain accompagne."
              description={
                <>
                  <p>{INTRO}</p>
                  <p className="mt-4">
                    {VISIT_LEAD} <strong className="font-semibold text-band-foreground">{VISIT_STRONG}</strong>
                  </p>
                </>
              }
            />
            <Reveal delay={0.1} y={12}>
              <p className="mt-8 max-w-[34rem] text-pretty text-[15.5px] leading-relaxed text-band-muted">{OUTRO}</p>
            </Reveal>
            <Reveal delay={0.16} y={12}>
              <p className="mt-8 border-l-2 border-primary-on-band pl-5 font-display text-[clamp(1.2rem,2.2vw,1.55rem)] font-semibold leading-snug tracking-[-0.03em] text-band-foreground">
                {CLOSING}
              </p>
            </Reveal>
          </div>

          <div className="lg:self-center">
            <Reveal y={12}>
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.16em] text-primary-on-band">
                {VISIT_INTRO}
              </p>
            </Reveal>
            <ul className="mt-5 flex flex-col">
              {MEETINGS.map((item, index) => (
                <Reveal key={item} delay={0.08 + index * 0.07} y={12}>
                  <li className="flex gap-5 border-t border-band-border py-5 last:border-b">
                    <span className="mt-0.5 font-mono text-[11px] font-medium tracking-[0.12em] text-primary-on-band">
                      {`0${index + 1}`}
                    </span>
                    <span className="text-[15.5px] leading-snug text-band-foreground">{item}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
