import { motion, useReducedMotion } from "framer-motion";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type FlipWord = {
  text: string;
  accent?: boolean;
  className?: string;
};

type FlipWordsProps = {
  words: FlipWord[];
  className?: string;
  accentClassName?: string;
  baseDelay?: number;
  stagger?: number;
};

/** Words rotate in on the X axis, one after the other. Static for reduced-motion users. */
export function FlipWords({
  words,
  className,
  accentClassName = "text-primary",
  baseDelay = 0.12,
  stagger = 0.085,
}: FlipWordsProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <span className={className}>
        {words.map((word, index) => (
          <span
            key={index}
            className={cn("inline-block", word.accent && accentClassName, word.className)}
          >
            {word.text}
            {index < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={cn("inline-block [perspective:900px]", className)}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className={cn("inline-block will-change-transform", word.accent && accentClassName, word.className)}
          style={{ transformOrigin: "50% 100%", backfaceVisibility: "hidden" }}
          initial={{ rotateX: -92, y: "0.32em", opacity: 0 }}
          animate={{ rotateX: 0, y: "0em", opacity: 1 }}
          transition={{ duration: 0.7, delay: baseDelay + index * stagger, ease: EASE_OUT }}
        >
          {word.text}
          {index < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
}
