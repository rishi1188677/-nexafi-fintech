/**
 * NMS v1.0 — Hover & interaction variants
 * Subtle, magnetic hover effects. Never exaggerated.
 */

import { FAST, SPRING } from './constants'

// ─── Hover lifts ─────────────────────────────────────────────────────────────

/** Subtle card lift — 3px raise, spring physics */
export const hoverLift = {
  whileHover: { y: -3, transition: SPRING },
  whileTap: { y: 0, scale: 0.99, transition: { duration: FAST } },
}

/** Micro lift — 2px for denser cards */
export const hoverMicroLift = {
  whileHover: { y: -2, transition: SPRING },
  whileTap: { y: 0, transition: { duration: FAST } },
}

/** Icon lift — rotates + rises slightly for call-to-action icons */
export const hoverIconLift = {
  whileHover: { y: -1, rotate: -3, transition: SPRING },
}

// ─── Button presses ───────────────────────────────────────────────────────────

/** Primary button — compresses to 97%, no bounce */
export const buttonPress = {
  whileHover: { scale: 1.02, transition: { duration: FAST } },
  whileTap: { scale: 0.97, transition: { duration: FAST } },
}

/** Ghost/outline button — very subtle */
export const buttonPressSubtle = {
  whileHover: { scale: 1.01, transition: { duration: FAST } },
  whileTap: { scale: 0.98, transition: { duration: FAST } },
}

/** Icon button — compresses to 93% */
export const iconButtonPress = {
  whileHover: { scale: 1.05, transition: { duration: FAST } },
  whileTap: { scale: 0.93, transition: { duration: FAST } },
}

// ─── Link hover ───────────────────────────────────────────────────────────────

/** Subtle rightward nudge on hover for "View →" style links */
export const hoverArrowNudge = {
  whileHover: { x: 2, transition: { duration: FAST } },
}
