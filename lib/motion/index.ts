/**
 * NexaFi Motion System (NMS v1.0)
 * ─────────────────────────────────────────────────────────────────────────────
 * Public barrel export — import everything from '@/lib/motion'
 *
 * @example
 * import { fadeUp, cardReveal, EASE, SPRING, staggerContainer, staggerItem } from '@/lib/motion'
 */

// Constants
export * from './constants'

// Variants
export * from './fade'
export * from './scale'
export * from './stagger'
export * from './page'
export * from './card'
export * from './modal'
export * from './hover'
export * from './glow'

// Hooks (number animations) — 'use client' only
export { useCountUp, useCountUpFormatted, useCountUpPercent } from './number'
