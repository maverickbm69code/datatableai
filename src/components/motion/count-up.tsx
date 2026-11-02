import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { EASE_OUT } from "@/lib/motion";

type CountUpProps = {
  value: number;
  /** Starts the animation once the element is on screen. */
  active?: boolean;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

const format = (value: number, decimals: number) =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

/** Counts from 0 up to the value. The final value is always in the DOM for screen readers. */
export function CountUp({
  value,
  active = true,
  duration = 0.9,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    if (!active) return;

    const controls = animate(0, value, {
      duration,
      delay,
      ease: EASE_OUT,
      onUpdate: (latest) => setDisplay(latest),
    });

    return () => controls.stop();
  }, [active, delay, duration, reduced, value]);

  return (
    <span className={className}>
      <span aria-hidden="true" className="tnum">
        {prefix}
        {format(display, decimals)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {format(value, decimals)}
        {suffix}
      </span>
    </span>
  );
}
