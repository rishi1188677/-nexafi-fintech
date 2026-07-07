/**
 * NMS v1.0 — Scale variants
 * Subtle scale animations. Never exaggerated. No bounce.
 */

import type { Variants } from 'framer-motion'
import { NORMAL, FAST, EASE, SPRING_GENTLE, SPRING_SNAPPY } from './constants'

/** Card / panel gently scales up from 96% on entry */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: NORMAL, ease: EASE },
  },
}

/** Modal scales from 94% — slightly larger travel for emphasis */
export const scaleModal: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING_GENTLE,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: FAST, ease: EASE },
  },
}

/** Dropdown / popover scales from 97% */
export const scaleDropdown: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: FAST, ease: EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -4,
    transition: { duration: FAST, ease: EASE },
  },
}

/** Notification / badge pops in with snappy spring */
export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING_SNAPPY,
  },
}

/** Button press — compresses slightly, never bounces */
export const scalePress = {
  whileTap: { scale: 0.97, transition: { duration: FAST, ease: EASE } },
}
