/**
 * NexaFi Motion System (NMS v1.0)
 * ─────────────────────────────────────────────────────────────────────────────
 * Core constants — the single source of truth for all timing, easing, and
 * spring values across the entire application.
 *
 * Philosophy:
 *   Calm · Intelligent · Precise · Never distracting.
 *   Motion explains actions; it does not decorate them.
 *   Cards glide. Buttons compress. Dialogs scale. Numbers count. AI pulses.
 */

import type { Transition, Easing } from 'framer-motion'

// ─── Easing ──────────────────────────────────────────────────────────────────

/**
 * NexaFi standard ease — smooth acceleration in, crisp deceleration out.
 * Derived from the cubic-bezier used in premium SaaS motion design.
 */
export const EASE: Easing = [0.22, 1, 0.36, 1]

/**
 * Gentle ease for elements that appear from nothing (fades, overlays).
 */
export const EASE_OUT: Easing = [0.0, 0.0, 0.2, 1.0]

/**
 * Snappy ease for micro-interactions (button presses, badge pops).
 */
export const EASE_SNAPPY: Easing = [0.36, 0.66, 0.04, 1]

// ─── Duration constants ───────────────────────────────────────────────────────

/** Micro-interactions: button press, icon swap */
export const FAST = 0.14

/** Standard transitions: card reveal, modal open */
export const NORMAL = 0.45

/** Cinematic reveals: page entry, hero section */
export const SLOW = 0.65

// ─── Spring presets ───────────────────────────────────────────────────────────

/**
 * NexaFi standard spring — not bouncy, not stiff.
 * Used for hover lifts and card reveals.
 */
export const SPRING: Transition = {
  type: 'spring',
  stiffness: 340,
  damping: 38,
  mass: 0.8,
}

/**
 * Gentle spring for modals and drawers — deliberate feel.
 */
export const SPRING_GENTLE: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 32,
  mass: 1.0,
}

/**
 * Snappy spring for small confirmations (checkmarks, badges).
 */
export const SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 44,
  mass: 0.6,
}

// ─── Stagger ─────────────────────────────────────────────────────────────────

/** Tight stagger for dense lists (transactions, insights) */
export const STAGGER_TIGHT = 0.04

/** Normal stagger for card grids */
export const STAGGER_NORMAL = 0.07

/** Loose stagger for hero badge groups */
export const STAGGER_LOOSE = 0.12

// ─── Viewport margin ─────────────────────────────────────────────────────────

export const VIEWPORT_MARGIN = '-80px'
export const VIEWPORT_MARGIN_TIGHT = '-40px'

// ─── Reduced-motion utility ───────────────────────────────────────────────────

/**
 * Returns reduced-motion-safe transition.
 * Always pass this through `useReducedMotion()` at the component level.
 */
export function reducedTransition(full: Transition): Transition {
  return { ...full, duration: 0, delay: 0 }
}

// ─── Transition builders ─────────────────────────────────────────────────────

export function tween(duration = NORMAL, delay = 0): Transition {
  return { type: 'tween', duration, delay, ease: EASE }
}

export function tweenFast(delay = 0): Transition {
  return { type: 'tween', duration: FAST, delay, ease: EASE_SNAPPY }
}

export function tweenSlow(delay = 0): Transition {
  return { type: 'tween', duration: SLOW, delay, ease: EASE }
}
