'use client'

/**
 * NMS v1.0 — Reusable motion primitive components
 *
 * Drop-in wrappers that apply NMS variants without each component
 * needing to import Framer Motion directly.
 *
 * Components:
 *   <Reveal>          — scroll-triggered fade reveal
 *   <MotionList>      — stagger container
 *   <MotionItem>      — stagger child
 *   <PageMotion>      — page-level entry wrapper
 *   <HoverCard>       — card with lift hover
 */

import { useReducedMotion, motion, type Variants } from 'framer-motion'
import type { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import {
  fadeUp,
  fadeCinematic,
  fadeLeft,
  fadeRight,
  staggerContainer,
  staggerContainerTight,
  staggerItem,
  staggerItemLeft,
  cardReveal,
  pageEnter,
  VIEWPORT_MARGIN,
} from '@/lib/motion'
import { hoverLift } from '@/lib/motion/hover'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevealProps {
  children: ReactNode
  className?: string
  /** Animation direction / variant preset */
  variant?: 'up' | 'left' | 'right' | 'cinematic' | 'card'
  /** Extra delay in seconds */
  delay?: number
  /** Viewport margin before trigger */
  margin?: string
  /** Only animate once (default true) */
  once?: boolean
}

interface MotionListProps {
  children: ReactNode
  className?: string
  /** Use tight stagger for dense lists */
  tight?: boolean
  delay?: number
  once?: boolean
  margin?: string
  as?: keyof JSX.IntrinsicElements
}

interface MotionItemProps {
  children: ReactNode
  className?: string
  /** Left-slide variant (for sidebar items) */
  direction?: 'up' | 'left'
}

// ─── Reveal ───────────────────────────────────────────────────────────────────

const REVEAL_MAP: Record<NonNullable<RevealProps['variant']>, Variants> = {
  up: fadeUp,
  left: fadeLeft,
  right: fadeRight,
  cinematic: fadeCinematic,
  card: cardReveal,
}

/**
 * <Reveal> — Scroll-triggered reveal for any element.
 * Respects prefers-reduced-motion.
 *
 * @example
 * <Reveal delay={0.1}>
 *   <p>Animated content</p>
 * </Reveal>
 */
export function Reveal({
  children,
  className,
  variant = 'up',
  delay = 0,
  margin = VIEWPORT_MARGIN,
  once = true,
}: RevealProps) {
  const shouldReduce = useReducedMotion()
  const variants = REVEAL_MAP[variant]

  // If user prefers reduced motion, render without animation
  if (shouldReduce) {
    return <div className={className}>{children}</div>
  }

  const transition = variants.visible &&
    typeof variants.visible === 'object' &&
    'transition' in variants.visible
      ? { ...(variants.visible as any).transition, delay }
      : { delay }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={{
        hidden: variants.hidden,
        visible: {
          ...(variants.visible as object),
          transition,
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// ─── MotionList & MotionItem ──────────────────────────────────────────────────

/**
 * <MotionList> — Stagger container. Pair with <MotionItem> children.
 *
 * @example
 * <MotionList>
 *   {items.map(item => <MotionItem key={item.id}><Card /></MotionItem>)}
 * </MotionList>
 */
export function MotionList({
  children,
  className,
  tight = false,
  delay = 0,
  once = true,
  margin = VIEWPORT_MARGIN,
}: MotionListProps) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div className={className}>{children}</div>
  }

  const container = tight ? staggerContainerTight : staggerContainer

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={{
        hidden: container.hidden,
        visible: {
          ...(container.visible as object),
          transition: {
            ...((container.visible as any)?.transition ?? {}),
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * <MotionItem> — Stagger child. Must be inside <MotionList>.
 */
export function MotionItem({ children, className, direction = 'up' }: MotionItemProps) {
  const shouldReduce = useReducedMotion()
  if (shouldReduce) return <div className={className}>{children}</div>

  const variants = direction === 'left' ? staggerItemLeft : staggerItem

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  )
}

// ─── PageMotion ───────────────────────────────────────────────────────────────

/**
 * <PageMotion> — Wrap the top-level content of any page for entry animation.
 * Do NOT wrap the layout shell with this.
 *
 * @example
 * export default function GoalsPage() {
 *   return <PageMotion><GoalsClient /></PageMotion>
 * }
 */
export function PageMotion({ children, className }: { children: ReactNode; className?: string }) {
  const shouldReduce = useReducedMotion()
  if (shouldReduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={pageEnter}
    >
      {children}
    </motion.div>
  )
}

// ─── HoverCard ────────────────────────────────────────────────────────────────

/**
 * <HoverCard> — Applies NMS hover-lift to any card wrapper.
 * Purely a motion wrapper — add your own styling via className.
 *
 * @example
 * <HoverCard className="rounded-xl border bg-card p-5">
 *   <StatCard />
 * </HoverCard>
 */
export function HoverCard({
  children,
  className,
  ...props
}: {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLDivElement>) {
  const shouldReduce = useReducedMotion()
  if (shouldReduce) return <div className={cn(className)} {...props}>{children}</div>

  return (
    <motion.div
      className={cn(className)}
      whileHover={hoverLift.whileHover}
      whileTap={hoverLift.whileTap}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}
