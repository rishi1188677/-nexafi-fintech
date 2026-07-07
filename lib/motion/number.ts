/**
 * NMS v1.0 — Number animation utilities
 * Animated counting for financial figures.
 * Numbers count upward. Never abruptly appear.
 */

'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion'

interface UseCountUpOptions {
  /** Target value to animate to */
  to: number
  /** Starting value (default 0) */
  from?: number
  /** Duration in ms (default 800) */
  duration?: number
  /** Decimal places (default 0) */
  decimals?: number
  /** Triggered when truthy (default: immediately) */
  trigger?: boolean
}

/**
 * useCountUp — animates a number from `from` to `to` using a spring.
 * Returns a MotionValue<string> suitable for use in `motion.span`.
 *
 * @example
 * const value = useCountUp({ to: 48000, decimals: 0 })
 * return <motion.span>{value}</motion.span>
 */
export function useCountUp({
  to,
  from = 0,
  duration = 800,
  decimals = 0,
  trigger = true,
}: UseCountUpOptions): MotionValue<string> {
  const motionValue = useMotionValue(trigger ? from : to)
  const springValue = useSpring(motionValue, {
    stiffness: 60,
    damping: 18,
    mass: 0.8,
  })
  const displayValue = useTransform(springValue, (v) =>
    v.toFixed(decimals)
  )

  useEffect(() => {
    if (!trigger) return
    motionValue.set(to)
  }, [to, trigger, motionValue])

  return displayValue
}

/**
 * useCountUpFormatted — like useCountUp but returns a formatted INR string.
 *
 * @example
 * const value = useCountUpFormatted({ to: 48000 })
 * return <motion.span>{value}</motion.span>
 */
export function useCountUpFormatted({
  to,
  from = 0,
  trigger = true,
}: {
  to: number
  from?: number
  trigger?: boolean
}): MotionValue<string> {
  const motionValue = useMotionValue(trigger ? from : to)
  const springValue = useSpring(motionValue, {
    stiffness: 55,
    damping: 18,
    mass: 0.9,
  })
  const displayValue = useTransform(springValue, (v) => {
    const n = Math.round(Math.abs(v))
    const formatted = new Intl.NumberFormat('en-IN').format(n)
    return `₹${formatted}`
  })

  useEffect(() => {
    if (!trigger) return
    motionValue.set(to)
  }, [to, trigger, motionValue])

  return displayValue
}

/**
 * useCountUpPercent — formats as a percentage string.
 */
export function useCountUpPercent({
  to,
  from = 0,
  trigger = true,
}: {
  to: number
  from?: number
  trigger?: boolean
}): MotionValue<string> {
  const motionValue = useMotionValue(trigger ? from : to)
  const springValue = useSpring(motionValue, {
    stiffness: 60,
    damping: 20,
  })
  const displayValue = useTransform(springValue, (v) => `${Math.round(v)}%`)

  useEffect(() => {
    if (!trigger) return
    motionValue.set(to)
  }, [to, trigger, motionValue])

  return displayValue
}
