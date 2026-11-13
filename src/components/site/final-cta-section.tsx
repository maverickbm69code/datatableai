import { Reveal } from "@/components/motion/reveal";
import { LeadForm } from "@/components/site/lead-form";
import { useCopy } from "@/lib/i18n";

const COPY = {
  fr: {
    title: "Votre premier mois est offert.",
    body: "Laissez votre e-mail : on vous recontacte sous 48 heures pour organiser l'export de vos ventes.",
    direct: "Ou directement :",
  },
  en: {
    title: "Your first month is on us.",
    body: "Leave your email and we'll get back to you within 48 hours to set up your sales export.",
    direct: "Or call us directly:",
  },
};

export function FinalCtaSection() {
  const t = useCopy(COPY);
  return (
    <section id="diagnostic" className="py-16 md:py-24">
      <div className="shell">
        <div className="relative overflow-hidden rounded-xl border border-cta-border bg-cta-soft px-6 py-14 text-center md:px-16 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(60% 70% at 50% 0%, hsl(var(--primary) / 0.10) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex flex-col items-center">
            <Reveal y={12}>
              <h2 className="text-balance font-display text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-[1.06] tracking-[-0.04em] text-foreground">
                {t.title}
              </h2>
            </Reveal>

            <Reveal delay={0.08} y={12}>
              <p className="mt-5 max-w-[36rem] text-pretty text-[16.5px] leading-relaxed text-muted-foreground">
                {t.body}
              </p>
            </Reveal>

            <Reveal delay={0.16} y={12} className="mt-9 w-full">
              <div className="flex justify-center">
                <LeadForm source="footer" />
              </div>
            </Reveal>

            <Reveal delay={0.24} y={10}>
              <p className="mt-7 text-[15px] text-muted-foreground">
                {t.direct}{" "}
                <a
                  href="tel:+33695992662"
                  className="font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-primary"
                >
                  06 95 99 26 62
                </a>
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
