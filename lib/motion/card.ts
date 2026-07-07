/**
 * NMS v1.0 — Card variants
 * Dashboard cards, feature cards, and insight cards.
 * Cards never jump. Cards glide.
 */

import type { Variants } from 'framer-motion'
import { NORMAL, FAST, EASE, SPRING } from './constants'

/**
 * Standard dashboard card reveal — glides up from y+14 with opacity.
 * Use with stagger container for grids.
 */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: NORMAL, ease: EASE },
  },
}

/**
 * Stat card — slides up from y+10 with opacity.
 * Slightly less travel than a full card reveal.
 */
export const statCardReveal: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: NORMAL, ease: EASE },
  },
}

/**
 * Feature/marketing card — more travel for first-impressions.
 */
export const featureCardReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: NORMAL, ease: EASE },
  },
}

/**
 * Hover lift — card rises slightly and gains shadow.
 * Use as whileHover prop values.
 */
export const cardHoverLift = {
  whileHover: {
    y: -3,
    transition: SPRING,
  },
}

/**
 * Hover glow ring — scale slightly on hover.
 * Pair with CSS shadow transition for full effect.
 */
export const cardHoverScale = {
  whileHover: {
    scale: 1.015,
    transition: { duration: FAST, ease: EASE },
  },
}

/**
 * Insight/notification card appear — subtle scale + fade from right.
 */
export const notificationReveal: Variants = {
  hidden: { opacity: 0, x: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: NORMAL, ease: EASE },
  },
  exit: {
    opacity: 0,
    x: 12,
    scale: 0.97,
    transition: { duration: FAST, ease: EASE },
  },
}

/**
 * Toast notification appear from bottom-right.
 */
export const toastReveal: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: NORMAL, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.97,
    transition: { duration: FAST, ease: EASE },
  },
}
