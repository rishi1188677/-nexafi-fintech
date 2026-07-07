/**
 * NMS v1.0 — Stagger variants
 * Container + child variants for orchestrated list and grid reveals.
 * Consume by wrapping a list in `staggerContainer` and each item in `staggerItem`.
 */

import type { Variants } from 'framer-motion'
import { STAGGER_TIGHT, STAGGER_NORMAL, STAGGER_LOOSE, NORMAL, EASE } from './constants'

// ─── Container variants ───────────────────────────────────────────────────────

/** Tight stagger for dense lists (transactions, insights, tool badges) */
export const staggerContainerTight: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER_TIGHT, delayChildren: 0 },
  },
}

/** Normal stagger for card grids (features, stat cards) */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER_NORMAL, delayChildren: 0 },
  },
}

/** Loose stagger for hero badges or prominent feature callouts */
export const staggerContainerLoose: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER_LOOSE, delayChildren: 0 },
  },
}

// ─── Child variants (use with any container above) ───────────────────────────

/** Standard stagger child — fade up */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: NORMAL, ease: EASE },
  },
}

/** Stagger child — fade only (for text-heavy lists) */
export const staggerItemFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: NORMAL, ease: EASE },
  },
}

/** Stagger child — fade left (sidebar items) */
export const staggerItemLeft: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: NORMAL, ease: EASE },
  },
}
