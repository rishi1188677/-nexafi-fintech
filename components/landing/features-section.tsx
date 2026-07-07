'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  Brain,
  CalendarClock,
  FileText,
  Gauge,
  PiggyBank,
  Repeat,
  ShieldCheck,
  Upload,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  sectionHeader,
  staggerContainer,
  featureCardReveal,
  VIEWPORT_MARGIN,
} from '@/lib/motion'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  badge?: string
  accent?: string
}

const features: Feature[] = [
  {
    icon: Brain,
    title: 'AI Financial Coach',
    description:
      'Ask anything about your money. The AI agent runs deterministic calculations first — then explains the results in plain language.',
    badge: 'AI Agent 2.0',
    accent: 'text-violet-500',
  },
  {
    icon: Wallet,
    title: 'Smart Budget Planner',
    description:
      'Set flexible monthly budgets by category and watch live progress bars update as you spend. No spreadsheets required.',
    accent: 'text-primary',
  },
  {
    icon: PiggyBank,
    title: 'Savings Goals',
    description:
      'Create goals with target amounts and monthly contributions. See a realistic completion timeline for every goal.',
    accent: 'text-emerald-500',
  },
  {
    icon: CalendarClock,
    title: 'Recurring Payments',
    description:
      'Auto-detect subscriptions and recurring bills from your transaction history. Never get blindsided by forgotten charges.',
    accent: 'text-amber-500',
  },
  {
    icon: Repeat,
    title: 'Cash-flow Forecasting',
    description:
      'Project your month-end balance using actual income and spending patterns. Know your financial runway in real time.',
    accent: 'text-cyan-500',
  },
  {
    icon: FileText,
    title: 'Monthly Money Story',
    description:
      'A beautifully structured monthly report that turns raw data into a narrative — what happened, what changed, what to watch.',
    badge: 'New',
    accent: 'text-rose-500',
  },
  {
    icon: Upload,
    title: 'CSV Bank Import',
    description:
      'Import transactions from any Indian bank or UPI platform in seconds. Instant categorization, zero manual entry.',
    accent: 'text-blue-500',
  },
  {
    icon: Gauge,
    title: 'Financial Health Score',
    description:
      'A single honest score blending savings rate, spending stability, and net cashflow into one clear, actionable signal.',
    accent: 'text-orange-500',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-first Security',
    description:
      'Row-level security on every query. Your data is visible only to you — never used to train any model.',
    accent: 'text-primary',
  },
]

export function FeaturesSection() {
  const shouldReduce = useReducedMotion()

  return (
    <section className="relative border-b border-border/60 bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">

        {/* Header — NMS sectionHeader variant */}
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          variants={shouldReduce ? undefined : sectionHeader}
          initial={shouldReduce ? undefined : 'hidden'}
          whileInView={shouldReduce ? undefined : 'visible'}
          viewport={{ once: true, margin: VIEWPORT_MARGIN }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Feature set
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything your finances need, nothing they don't
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Nine interconnected tools that work together — from daily spending to long-term goal tracking.
          </p>
        </motion.div>

        {/* Feature grid — NMS staggerContainer + featureCardReveal */}
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={shouldReduce ? undefined : staggerContainer}
          initial={shouldReduce ? undefined : 'hidden'}
          whileInView={shouldReduce ? undefined : 'visible'}
          viewport={{ once: true, margin: '-60px' }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={shouldReduce ? undefined : featureCardReveal}
            >
              <div className="group relative h-full overflow-hidden rounded-xl border border-border/70 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                {/* Subtle hover glow */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl bg-gradient-to-br from-primary/5 to-transparent" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn(
                      'inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background',
                      f.accent
                    )}>
                      <f.icon className="size-5" />
                    </span>
                    {f.badge && (
                      <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
