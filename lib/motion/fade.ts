/**
 * NMS v1.0 — Fade variants
 * Opacity-only animations. Zero layout shift risk.
 */

import type { Variants } from 'framer-motion'
import { NORMAL, SLOW, EASE, EASE_OUT } from './constants'

/** Standard fade in from invisible */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: NORMAL, ease: EASE } },
}

/** Fade out to invisible */
export const fadeOut: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 0, transition: { duration: NORMAL, ease: EASE_OUT } },
}

/** Fade in with a gentle upward drift — section reveals */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: NORMAL, ease: EASE } },
}

/** Fade in with a gentle downward drift */
export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -14 },
  visible: { opacity: 1, y: 0, transition: { duration: NORMAL, ease: EASE } },
}

/** Slide in from left */
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: NORMAL, ease: EASE } },
}

/** Slide in from right */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: NORMAL, ease: EASE } },
}

/** Cinematic slow fade — hero, page entries */
export const fadeCinematic: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: SLOW, ease: EASE } },
}
