import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: "light" | "band";
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "left",
  className,
}: SectionHeadingProps) {
  const onBand = tone === "band";

  return (
    <div className={cn("max-w-[46rem]", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <Reveal y={10} duration={0.5}>
          <p className={cn("eyebrow", onBand && "text-primary-on-band")}>{eyebrow}</p>
        </Reveal>
      ) : null}

      <Reveal delay={0.06} y={14}>
        <h2
          className={cn(
            "mt-4 text-balance font-display text-[clamp(1.75rem,3.4vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.035em]",
            onBand ? "text-band-foreground" : "text-foreground",
          )}
        >
          {title}
        </h2>
      </Reveal>

      {description ? (
        <Reveal delay={0.12} y={12}>
          <div
            className={cn(
              "mt-5 text-pretty text-[16.5px] leading-relaxed",
              onBand ? "text-band-muted" : "text-muted-foreground",
            )}
          >
            {description}
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
