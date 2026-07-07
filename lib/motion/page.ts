/**
 * NMS v1.0 — Page & Section transition variants
 * Controls how entire pages and sections enter/exit.
 * Respects Next.js App Router layout constraints.
 */

import type { Variants } from 'framer-motion'
import { NORMAL, SLOW, EASE } from './constants'

/**
 * Page enter — content drifts up gently while fading in.
 * Applied to the top-level page wrapper.
 */
export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: NORMAL, ease: EASE },
  },
}

/**
 * Page exit — content fades out upward.
 */
export const pageExit: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.25, ease: EASE },
  },
}

/**
 * Section reveal — slightly more travel than page, used for major sections.
 */
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: SLOW, ease: EASE },
  },
}

/**
 * Section header — slightly shorter delay, used for the headline/eyebrow above a section.
 */
export const sectionHeader: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: NORMAL, ease: EASE },
  },
}
