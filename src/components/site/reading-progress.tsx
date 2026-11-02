import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** Hairline reading-progress bar, pinned to the bottom edge of the sticky header. */
export function ReadingProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });

  if (reduced) return null;

  return (
    <motion.span
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-primary to-primary-hover"
      style={{ scaleX }}
    />
  );
}
