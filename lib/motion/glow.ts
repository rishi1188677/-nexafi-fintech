/**
 * NMS v1.0 — Ambient & glow animation variants
 * Slow, calm animations for background orbs, AI pulse, and glow rings.
 * All GPU-friendly (opacity + transform only).
 */

import type { Variants } from 'framer-motion'

// ─── Ambient float ────────────────────────────────────────────────────────────

/**
 * Slow ambient float for background orbs — loops indefinitely.
 * Use as `animate` prop, not a variant.
 */
export const ambientFloat = {
  animate: {
    y: [0, -18, 0],
    x: [0, 8, 0],
    scale: [1, 1.03, 1],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

/** Slightly faster float for secondary orbs */
export const ambientFloatFast = {
  animate: {
    y: [0, -12, 0],
    x: [0, -6, 0],
    scale: [1, 1.02, 1],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// ─── AI thinking pulse ────────────────────────────────────────────────────────

/**
 * Subtle opacity pulse — used on AI loading states and the AI badge dot.
 */
export const aiPulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [0.97, 1.01, 0.97],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

/**
 * Typing indicator dots — each dot staggers.
 */
export const aiTypingDot = (delay: number) => ({
  animate: {
    y: [0, -4, 0],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    },
  },
})

// ─── Glow ─────────────────────────────────────────────────────────────────────

/**
 * Softly pulsing glow opacity for headline glow elements.
 */
export const glowPulse = {
  animate: {
    opacity: [0.3, 0.55, 0.3],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

/**
 * Shimmer scan — moves a highlight across an element.
 * Use with overflow-hidden container.
 */
export const shimmerScan: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: '100%',
    opacity: 1,
    transition: {
      duration: 1.4,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
}

// ─── Skeleton loading ─────────────────────────────────────────────────────────

/**
 * Skeleton pulse — use with `animate` prop.
 */
export const skeletonPulse = {
  animate: {
    opacity: [0.5, 0.9, 0.5],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// ─── Number highlight ─────────────────────────────────────────────────────────

/**
 * Flash highlight when a number value changes.
 * Apply to the wrapping span: animate to visible briefly then back.
 */
export const numberFlash: Variants = {
  idle: { color: 'inherit' },
  changed: {
    color: 'var(--primary)',
    transition: { duration: 0.15 },
  },
}
