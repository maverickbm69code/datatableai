import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MARK_WIDTH = 56;

function Fork({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M2 1v4.6a3 3 0 0 0 6 0V1" />
      <path d="M5 1v4.6" />
      <path d="M5 5.8V17" />
    </svg>
  );
}

function Knife({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 17V9.6" />
      <path d="M5 9.6c2.6-.7 3.6-2.3 3.6-4.7C8.6 2.5 7.2 1 5 1" />
      <path d="M5 1v8.6" />
    </svg>
  );
}

/**
 * Section separator: the hairline opens up as a table knife cuts the page,
 * then the place setting (fork and knife) settles into the cut.
 */
export function CutleryDivider({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const open = reduced ? true : inView;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("relative flex h-12 w-full items-center justify-center", className)}
    >
      <span className="h-px flex-1 bg-border" />

      <motion.span
        className="block shrink-0 overflow-hidden"
        initial={reduced ? false : { width: 0, opacity: 0 }}
        animate={open ? { width: MARK_WIDTH, opacity: 1 } : undefined}
        transition={{ duration: 0.45, delay: reduced ? 0 : 0.62, ease: EASE_OUT }}
      >
        <span className="flex w-[56px] items-center justify-center gap-2.5 text-primary">
          <Fork className="h-[22px] w-[12px]" />
          <Knife className="h-[22px] w-[12px]" />
        </span>
      </motion.span>

      <span className="h-px flex-1 bg-border" />

      {!reduced ? (
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.span
            className="block"
            initial={{ y: -34, opacity: 0 }}
            animate={open ? { y: [-34, -2, 28], opacity: [0, 1, 0] } : undefined}
            transition={{ duration: 0.95, times: [0, 0.5, 1], ease: "easeInOut", delay: 0.1 }}
          >
            <svg viewBox="0 0 10 40" className="h-10 w-[10px] text-primary" aria-hidden="true">
              <path d="M3 4a2 2 0 0 1 4 0v10l-2 24-2-24z" fill="currentColor" />
            </svg>
          </motion.span>
        </span>
      ) : null}
    </div>
  );
}
