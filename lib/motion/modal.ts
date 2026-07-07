/**
 * NMS v1.0 — Modal, drawer, and overlay variants
 * Dialogs gently scale. Overlays fade. Drawers slide.
 */

import type { Variants } from 'framer-motion'
import { FAST, EASE, SPRING_GENTLE } from './constants'

/**
 * Modal backdrop — full-screen overlay fades in/out.
 */
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: FAST, ease: EASE } },
  exit: { opacity: 0, transition: { duration: FAST, ease: EASE } },
}

/**
 * Modal panel — gentle scale from 94% + drift up from y+8.
 */
export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_GENTLE,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 6,
    transition: { duration: FAST, ease: EASE },
  },
}

/**
 * Sheet / bottom drawer — slides up from below.
 */
export const drawerBottom: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_GENTLE,
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: 0.25, ease: EASE },
  },
}

/**
 * Sheet / side drawer — slides in from right.
 */
export const drawerRight: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: SPRING_GENTLE,
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { duration: 0.25, ease: EASE },
  },
}

/**
 * Dropdown / select menu — scales from top-left.
 */
export const dropdownReveal: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: -6 },
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

/**
 * Sidebar collapse/expand — width transition wrapper.
 */
export const sidebarExpand: Variants = {
  collapsed: { opacity: 0, x: -8 },
  expanded: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: EASE },
  },
}
