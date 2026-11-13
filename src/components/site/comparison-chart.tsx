import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { CountUp } from "@/components/motion/count-up";
import { useCopy } from "@/lib/i18n";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Metric = {
  label: string;
  restaurant: number;
  market: number;
  decimals: number;
  suffix?: string;
};

const COPY = {
  fr: {
    title: "Face à votre marché",
    you: "Votre restaurant",
    peers: "Restaurants comparables",
    metrics: [
      { label: "Part des boissons", restaurant: 30.4, market: 32, decimals: 1, suffix: " %" },
      { label: "Cafés par couvert", restaurant: 0.12, market: 0.2, decimals: 2 },
      { label: "Entrées par couvert", restaurant: 0.6, market: 0.47, decimals: 2 },
    ] as Metric[],
  },
  en: {
    title: "How you stack up against your market",
    you: "Your restaurant",
    peers: "Comparable restaurants",
    metrics: [
      { label: "Beverage mix", restaurant: 30.4, market: 32, decimals: 1, suffix: "%" },
      { label: "Coffee per cover", restaurant: 0.12, market: 0.2, decimals: 2 },
      { label: "Appetizers per cover", restaurant: 0.6, market: 0.47, decimals: 2 },
    ] as Metric[],
  },
};

type BarRowProps = {
  label: string;
  value: number;
  ratio: number;
  decimals: number;
  suffix?: string;
  active: boolean;
  delay: number;
  highlight?: boolean;
};

function BarRow({ label, value, ratio, decimals, suffix, active, delay, highlight }: BarRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[112px] shrink-0 text-[12.5px] leading-tight text-band-muted">{label}</span>
      <span
        className={cn(
          "relative h-2.5 flex-1 overflow-hidden rounded-full",
          "bg-band-foreground/10",
        )}
        aria-hidden="true"
      >
        <motion.span
          className={cn(
            "block h-full origin-left rounded-full",
            highlight ? "bg-gradient-to-r from-primary to-primary-hover" : "bg-band-muted/45",
          )}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: active ? ratio : 0 }}
          transition={{ duration: 0.65, delay, ease: EASE_OUT }}
        />
      </span>
      <span
        className={cn(
          "w-[62px] shrink-0 text-right font-mono text-[12.5px] font-medium",
          highlight ? "text-band-foreground" : "text-band-muted",
        )}
      >
        <CountUp value={value} active={active} delay={delay} decimals={decimals} suffix={suffix} />
      </span>
    </div>
  );
}

export function ComparisonChart({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { once: true, amount: 0.3 });
  const t = useCopy(COPY);

  return (
    <div ref={ref} className={cn("band-card p-6 md:p-7", className)}>
      <h3 className="font-display text-[17px] font-semibold tracking-[-0.02em] text-band-foreground">
        {t.title}
      </h3>

      <ul className="mt-6 flex flex-col gap-6">
        {t.metrics.map((metric, index) => {
          const max = Math.max(metric.restaurant, metric.market);
          const baseDelay = reduced ? 0 : 0.15 + index * 0.12;
          return (
            <li key={metric.label}>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-band-muted">
                {metric.label}
              </p>
              <div className="mt-3 flex flex-col gap-2.5">
                <BarRow
                  label={t.you}
                  value={metric.restaurant}
                  ratio={metric.restaurant / max}
                  decimals={metric.decimals}
                  suffix={metric.suffix}
                  active={active}
                  delay={baseDelay}
                  highlight
                />
                <BarRow
                  label={t.peers}
                  value={metric.market}
                  ratio={metric.market / max}
                  decimals={metric.decimals}
                  suffix={metric.suffix}
                  active={active}
                  delay={baseDelay + 0.08}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-band-border pt-5">
        <span className="flex items-center gap-2 text-[12.5px] text-band-muted">
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
          {t.you}
        </span>
        <span className="flex items-center gap-2 text-[12.5px] text-band-muted">
          <span className="h-2 w-2 rounded-full bg-band-muted/45" aria-hidden="true" />
          {t.peers}
        </span>
      </div>
    </div>
  );
}
