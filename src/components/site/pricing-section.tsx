import { Check } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  price: string;
  priceNote?: string;
  priceNoteInline?: boolean;
  features: string[];
  featured?: boolean;
  badge?: string;
};

const PLANS: Plan[] = [
  {
    name: "Diagnostic",
    price: "Offert",
    priceNote: "1er mois",
    priceNoteInline: true,
    features: ["Un mois analysé", "Rapport avec leviers chiffrés", "30 minutes de restitution"],
  },
  {
    name: "Essentiel",
    price: "119 €",
    priceNote: "HT / mois",
    features: ["Rapport mensuel", "Suivi des actions et des gains", "Comparaison à votre marché"],
  },
  {
    name: "Complet",
    price: "199 €",
    priceNote: "HT / mois",
    features: [
      "Tout l'Essentiel",
      "Analyse par serveur et par service",
      "Un point mensuel dans votre établissement",
    ],
    featured: true,
    badge: "Le plus complet",
  },
  {
    name: "Groupe",
    price: "Sur devis",
    features: ["Plusieurs établissements comparés entre eux."],
  },
];

export function PricingSection() {
  return (
    <section id="abonnements" className="py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Abonnements"
          title="Sans engagement, tarifs de lancement."
          description="Tarifs HT par établissement."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 0.07} y={18} className={cn(plan.featured && "lg:z-10")}>
              <article
                className={cn(
                  "relative flex h-full flex-col p-7 transition-all duration-300",
                  plan.featured
                    ? "band-surface rounded-lg border border-band-border text-band-foreground shadow-band lg:scale-[1.035] lg:py-8"
                    : "card-surface hover:-translate-y-1 hover:shadow-card-hover",
                )}
              >
                {plan.badge ? (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary-foreground shadow-card">
                    {plan.badge}
                  </span>
                ) : null}

                <h3
                  className={cn(
                    "font-display text-[18px] font-semibold tracking-[-0.02em]",
                    plan.featured ? "text-band-foreground" : "text-foreground",
                  )}
                >
                  {plan.name}
                </h3>

                <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                    className={cn(
                      "font-mono text-[27px] font-medium leading-none tracking-[-0.02em]",
                      plan.featured ? "text-band-foreground" : "text-foreground",
                    )}
                  >
                    {plan.price}
                  </span>
                  {plan.priceNote ? (
                    <span
                      className={cn(
                        "font-mono text-[12px]",
                        plan.featured ? "text-band-muted" : "text-muted-foreground",
                      )}
                    >
                      {plan.priceNoteInline ? `/ ${plan.priceNote}` : plan.priceNote}
                    </span>
                  ) : null}
                </p>

                <hr
                  className={cn(
                    "my-6 border-0 border-t",
                    plan.featured ? "border-band-border" : "border-border",
                  )}
                />

                <ul className="flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          plan.featured ? "text-primary-on-band" : "text-primary",
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "text-[14.5px] leading-snug",
                          plan.featured ? "text-band-muted" : "text-muted-foreground",
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.featured ? "default" : "secondary"}
                  className="mt-8 w-full"
                >
                  <a href="#diagnostic">
                    {plan.name === "Diagnostic" ? "Mon diagnostic offert" : "Être contacté"}
                  </a>
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
