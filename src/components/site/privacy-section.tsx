import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { useCopy } from "@/lib/i18n";

type Commitment = {
  title: string;
  body: string;
};

const COMMITMENTS_FR: Commitment[] = [
  {
    title: "Accord signé d'abord",
    body: "Confidentialité signée avant tout export.",
  },
  {
    title: "Jamais revendues",
    body: "Vos données de caisse ne sont jamais cédées ni revendues.",
  },
  {
    title: "Comparaisons anonymes",
    body: "Aucun nom d'établissement, seulement des moyennes.",
  },
  {
    title: "Équipe protégée",
    body: "Noms des serveurs remplacés par un code.",
  },
  {
    title: "Supprimées sur demande",
    body: "Et à la fin de l'abonnement.",
  },
  {
    title: "Conforme au RGPD",
    body: "Hébergement dans l'Union européenne.",
  },
];

const COMMITMENTS_EN: Commitment[] = [
  { title: "NDA signed first", body: "A confidentiality agreement is signed before any data leaves your POS." },
  { title: "Never sold", body: "Your POS data is never shared, sold or resold." },
  { title: "Anonymous benchmarks", body: "No restaurant names, only averages." },
  { title: "Your staff stays protected", body: "Server names are replaced with an ID code." },
  { title: "Deleted on request", body: "And automatically when your subscription ends." },
  { title: "GDPR compliant", body: "Data hosted in the European Union." },
];

const COPY = {
  fr: { items: COMMITMENTS_FR, eyebrow: "Confidentialité", title: "Vos chiffres restent les vôtres." },
  en: { items: COMMITMENTS_EN, eyebrow: "Privacy", title: "Your numbers stay yours." },
};

export function PrivacySection() {
  const t = useCopy(COPY);
  return (
    <section id="confidentialite" className="py-20 md:py-28">
      <div className="shell">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} />

        <ul className="mt-14 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {t.items.map((commitment, index) => (
            <Reveal key={commitment.title} delay={index * 0.06} y={14}>
              <li className="flex gap-5">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-soft-strong bg-primary-soft font-mono text-[14px] font-medium text-accent-foreground"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-display text-[17.5px] font-semibold tracking-[-0.02em] text-foreground">
                    {commitment.title}
                  </h3>
                  <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground">
                    {commitment.body}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
