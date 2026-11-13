import { Reveal } from "@/components/motion/reveal";
import { RevealWords } from "@/components/motion/reveal-words";
import { useCopy } from "@/lib/i18n";

const COPY = {
  fr: {
    quote: "« Donner à chaque restaurant indépendant l'analyse dont disposent les grands groupes. »",
    bio: "Fondateur, directeur de restaurant à Paris, plus de sept ans de restauration haut de gamme.",
    background: [
      "Maxim's de Paris — équipe de 40, 25,5 M€ de CA annuel",
      "Riviera Dining Group, Miami — 800 clients par jour",
      "emlyon business school",
    ],
  },
  en: {
    quote: "“Give every independent restaurant the same kind of analytics the big restaurant groups already have.”",
    bio: "Founder and restaurant general manager in Paris, with 7+ years in fine dining.",
    background: [
      "Maxim's de Paris — 40-person team, $25.5M in annual sales",
      "Riviera Dining Group, Miami — 800 guests a day",
      "emlyon business school",
    ],
  },
};

export function FounderSection() {
  const t = useCopy(COPY);
  return (
    <section id="fondateur" className="py-20 md:py-28">
      <div className="shell grid gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal y={18}>
          <figure>
            <blockquote className="text-balance font-display text-[clamp(1.5rem,3vw,2.15rem)] font-bold leading-[1.14] tracking-[-0.035em] text-foreground">
              {t.quote}
            </blockquote>
          </figure>
        </Reveal>

        <Reveal delay={0.12} y={18}>
          <div className="flex gap-5">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-[17px] font-bold tracking-[-0.02em] text-primary-foreground"
              aria-hidden="true"
            >
              MB
            </span>
            <div>
              <p className="font-display text-[19px] font-semibold tracking-[-0.02em] text-foreground">
                Maverick Bouillot
              </p>
              <RevealWords
                className="mt-1.5 max-w-[34rem] text-[15px] leading-relaxed text-muted-foreground"
                text={t.bio}
              />

              <ul className="mt-6 flex flex-col">
                {t.background.map((item) => (
                  <li
                    key={item}
                    className="border-t border-border py-3.5 text-[14.5px] leading-snug text-muted-foreground last:border-b"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
