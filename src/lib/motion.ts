/** Shared easing curve for every scroll-triggered motion in the site. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Viewport config used by all reveal animations (fires once, slightly before fully in view). */
export const REVEAL_VIEWPORT = { once: true, amount: 0.18 } as const;
