import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, BarChart3, CalendarCheck, Check, Coffee, Gift, Handshake, Star, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef, type MouseEvent, type ReactNode } from "react";

import { CountUp } from "@/components/motion/count-up";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/lib/i18n";
import { EASE_OUT } from "@/lib/motion";
import { selectOffer } from "@/lib/selected-offer";
import { cn } from "@/lib/utils";

type Offer = {
  id: string;
  name: string;
  icon: LucideIcon;
  audience: string;
  price: number;
  features: string[];
  cta: string;
};

const OFFERS_FR: Offer[] = [
  {
    id: "coffee-shop",
    name: "Coffee Shop",
    icon: Coffee,
    audience: "Pour les coffee shops, salons de thé et petites structures.",
    price: 199,
    features: [
      "Tableau de bord intelligent",
      "Analyse des ventes et des performances",
      "Suivi des coûts et de la rentabilité",
      "Veille concurrentielle locale quotidienne",
      "Recommandations personnalisées par l'IA",
    ],
    cta: "Choisir Coffee Shop",
  },
  {
    id: "restaurant",
    name: "Restaurant",
    icon: UtensilsCrossed,
    audience: "Pour les restaurants indépendants et traditionnels.",
    price: 299,
    features: [
      "Tableau de bord intelligent",
      "Analyse approfondie des performances financières",
      "Suivi des marges, des charges et de la rentabilité",
      "Veille concurrentielle locale quotidienne",
      "Identification des opportunités d'amélioration grâce à l'IA",
    ],
    cta: "Choisir Restaurant",
  },
  {
    id: "brasserie",
    name: "Brasserie",
    icon: BarChart3,
    audience: "Pour les établissements à forte activité.",
    price: 449,
    features: [
      "Tableau de bord intelligent",
      "Analyse avancée des données financières et opérationnelles",
      "Suivi de la masse salariale, des marges et de la rentabilité",
      "Veille concurrentielle locale quotidienne",
      "Analyses et recommandations stratégiques personnalisées",
    ],
    cta: "Choisir Brasserie",
  },
  {
    id: "gastronomique",
    name: "Gastronomique & Étoilé",
    icon: Star,
    audience: "Pour les restaurants gastronomiques et les établissements haut de gamme.",
    price: 699,
    features: [
      "Tableau de bord intelligent et personnalisé",
      "Analyse financière et stratégique sur mesure",
      "Suivi détaillé des coûts et des performances",
      "Veille concurrentielle locale quotidienne",
      "Recommandations adaptées aux spécificités de l'établissement",
    ],
    cta: "Choisir Gastronomique",
  },
];

const OFFERS_EN: Offer[] = [
  {
    ...OFFERS_FR[0],
    audience: "For coffee shops, cafés, tea rooms and other small operations.",
    features: [
      "Smart dashboard",
      "Sales and performance analysis",
      "Cost and profitability tracking",
      "Daily local competitor tracking",
      "Personalized, AI-driven recommendations",
    ],
    cta: "Choose Coffee Shop",
  },
  {
    ...OFFERS_FR[1],
    audience: "For independent, full-service restaurants.",
    features: [
      "Smart dashboard",
      "In-depth P&L and financial performance analysis",
      "Margin, operating cost and profitability tracking",
      "Daily local competitor tracking",
      "AI-identified opportunities to improve",
    ],
    cta: "Choose Restaurant",
  },
  {
    ...OFFERS_FR[2],
    name: "High-Volume",
    audience: "For busy, high-volume restaurants, brasseries and bistros.",
    features: [
      "Smart dashboard",
      "Advanced financial and operational analysis",
      "Labor cost, margin and profitability tracking",
      "Daily local competitor tracking",
      "Personalized strategic insights and recommendations",
    ],
    cta: "Choose High-Volume",
  },
  {
    ...OFFERS_FR[3],
    name: "Fine Dining & Michelin-Starred",
    audience: "For fine dining and upscale restaurants.",
    features: [
      "Smart, fully customized dashboard",
      "Custom financial and strategic analysis",
      "Detailed cost and performance tracking",
      "Daily local competitor tracking",
      "Recommendations built around your concept",
    ],
    cta: "Choose Fine Dining",
  },
];

const FREE_MONTH_TEXT =
  "Découvrez la puissance de DaTable, analysez vos performances et explorez votre environnement concurrentiel grâce à notre technologie et à notre accompagnement humain.";
const VISIT_TITLE = "Toutes nos offres incluent au minimum une visite par mois dans votre établissement.";
const VISIT_TEXT = "Parce que chez DaTable, la relation humaine est aussi importante que la puissance de nos analyses.";
const COMMITMENT_TEXT =
  "Un accompagnement dans la durée : engagement de 6 mois minimum ou 12 mois, selon votre choix.";

const COPY = {
  fr: {
    offers: OFFERS_FR,
    eyebrow: "Nos offres",
    title: "Des offres adaptées à votre établissement",
    description: "L'IA analyse, l'humain accompagne. Tarifs en euros HT par mois et par établissement.",
    freeTitle: "Votre premier mois est offert !",
    freeText: FREE_MONTH_TEXT,
    freeCta: "Profiter de mon premier mois offert",
    visitTitle: VISIT_TITLE,
    visitText: VISIT_TEXT,
    commitment: COMMITMENT_TEXT,
    perMonth: "HT / mois",
  },
  en: {
    offers: OFFERS_EN,
    eyebrow: "Pricing",
    title: "A plan for every type of restaurant",
    description: "AI does the analysis, our people guide you. Monthly pricing per location, plus applicable tax.",
    freeTitle: "Your first month is on us!",
    freeText:
      "See what DaTable can do: analyze your performance and size up your local competition, with our technology and hands-on support from our team.",
    freeCta: "Start my free month",
    visitTitle: "Every plan includes at least one in-person visit a month at your restaurant.",
    visitText: "Because at DaTable, the relationship matters just as much as the data.",
    commitment: "We're in it for the long haul: 6-month minimum or 12-month term, your choice.",
    perMonth: "/ month",
  },
};

/** Fade-and-rise that plays again every time the block scrolls back into view. */
function Replay({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.65, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

function OfferCard({ offer, index, perMonth }: { offer: Offer; index: number; perMonth: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduced = useReducedMotion();
  const Icon = offer.icon;

  function handleMove(event: MouseEvent<HTMLElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
  }

  return (
    <motion.article
      ref={ref}
      onMouseMove={handleMove}
      initial={reduced ? false : { opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={reduced ? undefined : { y: -8, transition: { type: "spring", stiffness: 320, damping: 22 } }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.09, ease: EASE_OUT }}
      className="card-surface group relative flex h-full flex-col overflow-hidden p-7 transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-card-hover"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-primary transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(280px circle at var(--mx, 50%) var(--my, 0%), hsl(var(--primary) / 0.11), transparent 70%)",
        }}
      />

      <div className="relative flex flex-1 flex-col">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>

        <h3 className="mt-5 font-display text-[19px] font-semibold tracking-[-0.02em] text-foreground">
          {offer.name}
        </h3>
        <p className="mt-2 text-[14px] leading-snug text-muted-foreground lg:min-h-[5.4rem]">{offer.audience}</p>

        <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <CountUp
            value={offer.price}
            currency
            active={inView}
            delay={index * 0.09 + 0.25}
            className="font-mono text-[30px] font-medium leading-none tracking-[-0.03em] text-foreground transition-colors duration-300 group-hover:text-primary"
          />
          <span className="font-mono text-[12px] text-muted-foreground">{perMonth}</span>
        </p>

        <hr className="my-6 border-0 border-t border-border" />

        <ul className="flex flex-1 flex-col gap-3">
          {offer.features.map((feature, i) => (
            <motion.li
              key={feature}
              className="flex gap-2.5"
              initial={reduced ? false : { opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.6 }}
              transition={{ duration: 0.45, delay: 0.3 + index * 0.09 + i * 0.07, ease: EASE_OUT }}
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-primary transition-transform duration-300 motion-safe:group-hover:scale-125"
                style={{ transitionDelay: `${i * 45}ms` }}
                aria-hidden="true"
              />
              <span className="text-[14.5px] leading-snug text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                {feature}
              </span>
            </motion.li>
          ))}
        </ul>

        <Button
          asChild
          variant="secondary"
          className="mt-8 w-full group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <a href="#diagnostic" onClick={() => selectOffer({ id: offer.id, name: offer.name, price: offer.price })}>
            {offer.cta}
            <ArrowRight
              className="h-4 w-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:w-4 group-hover:translate-x-0 group-hover:opacity-100"
              aria-hidden="true"
            />
          </a>
        </Button>
      </div>
    </motion.article>
  );
}

export function OffersSection() {
  const t = useCopy(COPY);
  return (
    <section id="offres" className="py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
          align="center"
        />

        <Replay className="mt-12">
          <div className="group relative overflow-hidden rounded-xl border border-cta-border bg-cta-soft px-6 py-8 md:px-10 md:py-9">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(50% 120% at 0% 0%, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="flex gap-4 md:gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card motion-safe:group-hover:animate-dt-wiggle">
                  <Gift className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-[clamp(1.2rem,2.2vw,1.5rem)] font-bold tracking-[-0.03em] text-foreground">
                    {t.freeTitle}
                  </h3>
                  <p className="mt-2 max-w-[44rem] text-pretty text-[15.5px] leading-relaxed text-muted-foreground">
                    {t.freeText}
                  </p>
                </div>
              </div>
              <Button asChild size="lg" className="btn-shimmer w-full shrink-0 md:w-auto">
                <a href="#diagnostic" onClick={() => selectOffer(null)}>
                  {t.freeCta}
                </a>
              </Button>
            </div>
          </div>
        </Replay>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.offers.map((offer, index) => (
            <OfferCard key={offer.id} offer={offer} index={index} perMonth={t.perMonth} />
          ))}
        </div>

        <Replay className="mt-8">
          <div className="band-surface relative overflow-hidden rounded-xl border border-band-border px-6 py-8 text-band-foreground shadow-band md:px-10 md:py-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-band-border bg-band-card text-primary-on-band">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-primary-on-band/40 motion-safe:animate-ping [animation-duration:2.8s]"
                />
                <Handshake className="relative h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-balance font-display text-[clamp(1.1rem,2vw,1.4rem)] font-semibold leading-snug tracking-[-0.025em] text-band-foreground">
                  {t.visitTitle}
                </h3>
                <p className="mt-2 text-pretty text-[15px] leading-relaxed text-band-muted">{t.visitText}</p>
              </div>
            </div>
          </div>
        </Replay>

        <Replay delay={0.1} className="mt-6">
          <p className="flex items-center justify-center gap-2.5 text-center text-[14px] leading-snug text-muted-foreground">
            <CalendarCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{t.commitment}</span>
          </p>
        </Replay>
      </div>
    </section>
  );
}
