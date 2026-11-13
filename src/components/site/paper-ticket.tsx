import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/utils";

export type TicketRow = {
  key: string;
  label: string;
  detail?: string;
  value: number;
  prefix?: string;
  suffix?: string;
  /** Amount in money: shown in € (French) or $ (English). */
  currency?: boolean;
  gain?: boolean;
};

type PaperTicketProps = {
  headline: string;
  meta: string;
  note?: string;
  rows: TicketRow[];
  totalLabel: string;
  totalValue: number;
  footerNote?: string;
  footerSignOff?: string;
  className?: string;
};

const ROW_STEP = 0.13;

/**
 * The signature object: a paper receipt that prints itself line by line,
 * while the amounts count up from zero.
 */
export function PaperTicket({
  headline,
  meta,
  note,
  rows,
  totalLabel,
  totalValue,
  footerNote,
  footerSignOff,
  className,
}: PaperTicketProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const started = inView;

  const initial = reduced ? false : { opacity: 0, y: -5, clipPath: "inset(0% 0% 100% 0%)" };
  const target = started && !reduced ? { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" } : undefined;

  const totalDelay = 0.18 + rows.length * ROW_STEP;

  return (
    <div ref={ref} className={cn("receipt px-6 pb-10 pt-6", className)}>
      <span className="receipt-tear" aria-hidden="true" />

      {!reduced ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-receipt-accent to-transparent"
          initial={{ top: "0%", opacity: 0 }}
          animate={started ? { top: ["0%", "0%", "100%"], opacity: [0, 1, 0] } : { top: "0%", opacity: 0 }}
          transition={{ duration: 1.15, times: [0, 0.12, 1], ease: "easeInOut" }}
        />
      ) : null}

      <motion.div initial={initial} animate={target} transition={{ duration: 0.24, ease: "linear" }}>
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-receipt-ink">
          {headline}
        </p>
        <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-receipt-muted-ink">
          {meta}
        </p>
        {note ? (
          <p className="mt-1.5 font-mono text-[10px] tracking-[0.04em] text-receipt-muted-ink">{note}</p>
        ) : null}
      </motion.div>

      <hr className="my-4 border-0 border-t border-dashed border-receipt-rule" />

      <div className="flex flex-col gap-3.5">
        {rows.map((row, index) => {
          const delay = 0.18 + index * ROW_STEP;
          return (
            <motion.div
              key={row.key}
              initial={initial}
              animate={target}
              transition={{ duration: 0.26, delay, ease: "linear" }}
              className="flex items-end justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-mono text-[12.5px] leading-snug text-receipt-ink">{row.label}</p>
                {row.detail ? (
                  <p className="mt-0.5 font-mono text-[11px] leading-snug text-receipt-muted-ink">
                    {row.detail}
                  </p>
                ) : null}
              </div>
              <p
                className={cn(
                  "shrink-0 font-mono text-[13.5px] font-medium leading-snug",
                  row.gain ? "text-receipt-accent" : "text-receipt-muted-ink",
                )}
              >
                <CountUp
                  value={row.value}
                  active={started}
                  delay={delay + 0.12}
                  prefix={row.prefix}
                  suffix={row.suffix}
                  currency={row.currency}
                />
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={initial}
        animate={target}
        transition={{ duration: 0.3, delay: totalDelay, ease: "linear" }}
        className="mt-5 border-t-2 border-receipt-rule pt-3.5"
      >
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-receipt-muted-ink">
            {totalLabel}
          </span>
          <span className="font-mono text-[26px] font-medium leading-none text-receipt-ink">
            <CountUp value={totalValue} active={started} delay={totalDelay + 0.24} currency />
          </span>
        </div>
      </motion.div>

      {footerNote ? (
        <motion.p
          initial={initial}
          animate={target}
          transition={{ duration: 0.3, delay: totalDelay + 0.7, ease: "linear" }}
          className="mt-8 text-center font-mono text-[10px] leading-relaxed tracking-[0.05em] text-receipt-muted-ink"
        >
          {footerNote}
          {footerSignOff ? (
            <>
              <br />
              {footerSignOff}
            </>
          ) : null}
        </motion.p>
      ) : null}
    </div>
  );
}
