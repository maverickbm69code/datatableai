import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/lib/i18n";

const COPY = {
  fr: {
    title: "Et si vos données vous rapportaient plus ?",
    body: "DaTable transforme vos données de caisse en plans d'action concrets et chiffrés pour améliorer la rentabilité de votre établissement.",
    cta: "Découvrir DaTable",
    contact: "Ou demandez votre diagnostic offert :",
    contactLink: "formulaire de contact",
  },
  en: {
    title: "What if your data earned you more?",
    body: "DaTable turns your POS data into concrete, quantified action plans to improve your restaurant's profitability.",
    cta: "Discover DaTable",
    contact: "Or ask for your free assessment:",
    contactLink: "contact form",
  },
};

/** Same block as the final call to action of the home page (frame, glow, staggered reveal). */
export function ArticleCta() {
  const t = useCopy(COPY);
  return (
    <section aria-labelledby="resources-cta-title" className="py-16 md:py-24">
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
              <h2
                id="resources-cta-title"
                className="text-balance font-display text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-[1.06] tracking-[-0.04em] text-foreground"
              >
                {t.title}
              </h2>
            </Reveal>

            <Reveal delay={0.08} y={12}>
              <p className="mt-5 max-w-[36rem] text-pretty text-[16.5px] leading-relaxed text-muted-foreground">
                {t.body}
              </p>
            </Reveal>

            <Reveal delay={0.16} y={12} className="mt-9">
              <Button asChild size="lg" className="btn-shimmer">
                <a href="/">
                  {t.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </Reveal>

            <Reveal delay={0.24} y={10}>
              <p className="mt-7 text-[15px] text-muted-foreground">
                {t.contact}{" "}
                <a
                  href="/#diagnostic"
                  className="font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-primary"
                >
                  {t.contactLink}
                </a>
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
