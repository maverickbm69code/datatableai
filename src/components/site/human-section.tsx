import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { useCopy } from "@/lib/i18n";

const COPY = {
  fr: {
    eyebrow: "L'humain au cœur de DaTable",
    title: "L'intelligence artificielle analyse. L'humain accompagne.",
    intro:
      "Chez DaTable, nous sommes convaincus que la technologie ne remplacera jamais la compréhension du terrain et le contact humain.",
    visitLead: "C'est pourquoi nous venons vous rencontrer",
    visitStrong: "au minimum une fois par mois, directement dans votre établissement.",
    visitIntro: "Ces rendez-vous permettent de :",
    outro:
      "Notre objectif n'est pas simplement de vous fournir des chiffres, mais de vous accompagner durablement dans la réussite de votre établissement.",
    closing: "L'IA observe et analyse. Ensemble, nous décidons.",
    meetings: [
      "Comprendre votre quotidien et vos problématiques.",
      "Analyser ensemble vos performances.",
      "Faire le point sur les évolutions de votre concurrence.",
      "Identifier les actions prioritaires pour améliorer votre rentabilité.",
      "Suivre les résultats des décisions prises les mois précédents.",
    ],
  },
  en: {
    eyebrow: "People at the heart of DaTable",
    title: "Artificial intelligence analyzes. People guide.",
    intro:
      "At DaTable, we believe technology will never replace on-the-ground understanding and human contact.",
    visitLead: "That's why we come to meet you",
    visitStrong: "at least once a month, right in your restaurant.",
    visitIntro: "These meetings help us:",
    outro:
      "Our goal isn't just to hand you numbers, but to support your restaurant's success over the long run.",
    closing: "AI observes and analyzes. Together, we decide.",
    meetings: [
      "Understand your day-to-day and your challenges.",
      "Review your performance together.",
      "Catch up on what your competitors are doing.",
      "Pinpoint the priority actions to boost your profitability.",
      "Track the results of decisions made in previous months.",
    ],
  },
};

export function HumanSection() {
  const t = useCopy(COPY);
  return (
    <section id="accompagnement" className="py-16 md:py-24">
      <div className="band-surface">
        <div className="shell grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-20">
          <div>
            <SectionHeading
              tone="band"
              eyebrow={t.eyebrow}
              title={t.title}
              description={
                <>
                  <p>{t.intro}</p>
                  <p className="mt-4">
                    {t.visitLead} <strong className="font-semibold text-band-foreground">{t.visitStrong}</strong>
                  </p>
                </>
              }
            />
            <Reveal delay={0.1} y={12}>
              <p className="mt-8 max-w-[34rem] text-pretty text-[15.5px] leading-relaxed text-band-muted">{t.outro}</p>
            </Reveal>
            <Reveal delay={0.16} y={12}>
              <p className="mt-8 border-l-2 border-primary-on-band pl-5 font-display text-[clamp(1.2rem,2.2vw,1.55rem)] font-semibold leading-snug tracking-[-0.03em] text-band-foreground">
                {t.closing}
              </p>
            </Reveal>
          </div>

          <div className="lg:self-center">
            <Reveal y={12}>
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.16em] text-primary-on-band">
                {t.visitIntro}
              </p>
            </Reveal>
            <ul className="mt-5 flex flex-col">
              {t.meetings.map((item, index) => (
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
