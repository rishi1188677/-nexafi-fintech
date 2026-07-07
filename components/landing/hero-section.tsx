'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Sparkles, Zap, TrendingUp, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const EASE = [0.22, 1, 0.36, 1] as const

const floatingBadges = [
  { icon: TrendingUp, label: 'Savings up 24% this month', color: 'text-emerald-500', delay: 0.45 },
  { icon: Zap, label: 'AI Agent 2.0 active', color: 'text-violet-500', delay: 0.6 },
  { icon: Sparkles, label: '₹15,200 saved so far', color: 'text-amber-500', delay: 0.75 },
  { icon: ShieldCheck, label: 'Bank-grade security', color: 'text-primary', delay: 0.9 },
]

// Ambient orb that slowly floats using CSS keyframe from globals
function AmbientOrb({
  size,
  color,
  top,
  left,
  blur,
  delay,
}: {
  size: string
  color: string
  top?: string
  left?: string
  blur: string
  delay: number
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full ${size} ${color} ${blur}`}
      style={{ top, left }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        scale: [1, 1.04, 1],
      }}
      transition={{
        duration: 8 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  )
}

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // Subtle parallax: content moves up slightly as user scrolls
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -40])
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -80])

  return (
    <section ref={ref} className="relative isolate overflow-hidden border-b border-border/60 bg-background">
      {/* Static grid texture */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />

      {/* Animated ambient orbs */}
      <AmbientOrb size="h-[700px] w-[700px]" color="bg-primary/7" top="-200px" left="50%" blur="blur-[130px]" delay={0} />
      <AmbientOrb size="h-[400px] w-[500px]" color="bg-accent/6" top="40%" left="-10%" blur="blur-[110px]" delay={2} />
      <AmbientOrb size="h-[350px] w-[400px]" color="bg-violet-500/5" top="20%" left="75%" blur="blur-[100px]" delay={4} />

      {/* Radial vignette glow */}
      <div className="pointer-events-none absolute inset-0 bg-radial-glow opacity-80" />

      <motion.div
        style={{ y: contentY }}
        className="relative mx-auto w-full max-w-6xl px-4 pt-20 pb-16 sm:px-6 lg:pt-28 lg:pb-24"
      >
        <div className="flex flex-col items-center text-center">

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              AI-Powered Personal Finance — Agent 2.0 Now Live
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          >
            Your{' '}
            <span className="relative inline-block">
              {/* Glow behind gradient text */}
              <motion.span
                className="absolute inset-0 -z-0 blur-3xl opacity-40 bg-gradient-to-r from-primary/60 to-accent/60"
                aria-hidden
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="relative z-10 bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                AI Money
              </span>
            </span>
            {' '}Command Center
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
          >
            NexaFi turns your real spending, budgets, goals, and recurring payments into clear daily
            insights — so you always know what changed, what matters, and what to do next.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
          >
            <Button
              size="lg"
              className="group h-12 gap-2 px-7 text-sm shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Get Started Free
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-7 text-sm hover:bg-muted/60 transition-colors"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              View Live Demo
            </Button>
          </motion.div>

          {/* Trust micro-copy */}
          <motion.p
            className="mt-4 text-xs text-muted-foreground/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            No credit card required · Bank-grade encryption · Your data stays yours
          </motion.p>

          {/* Floating achievement badges */}
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            {floatingBadges.map((badge, i) => (
              <motion.div
                key={badge.label}
                className="flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 shadow-md backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.88, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, delay: badge.delay, ease: EASE }}
                // Subtle ambient float per badge
                whileHover={{ y: -2, scale: 1.03, transition: { duration: 0.2 } }}
              >
                <badge.icon className={`size-3.5 ${badge.color}`} />
                <span className="text-xs font-medium text-foreground/80">{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
