'use client'

import { motion } from 'framer-motion'
import { Bot, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FloatingInsightCard } from './floating-insight-card'

const sampleInsights = [
  'Your dining expenses are 18% above your usual monthly average.',
  'Three recurring subscriptions are costing ₹1,247 each month.',
  'Your projected month-end balance is ₹18,600.',
  'Shopping spend is at 94% of your budget with 8 days left.',
]

export function AiBriefingSection() {
  return (
    <section className="relative border-b border-border/60 bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-radial-glow opacity-60" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <Bot className="size-3.5" />
              Daily AI Briefing
            </span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Plain-language insights, not another dashboard to decode
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              NexaFi's AI agent watches for the signals that actually move your finances —
              spending spikes, forgotten subscriptions, and projected balances — and
              explains them in a sentence.
            </p>

            {/* Sample insight lines */}
            <ul className="mt-6 space-y-3">
              {sampleInsights.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm"
                >
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-foreground/90">{line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                nativeButton={false}
                render={<Link href="/sign-up" />}
              >
                Try the AI Coach
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </motion.div>

          {/* Right: floating insight cards */}
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Decorative glow */}
            <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

            <FloatingInsightCard className="relative w-full max-w-sm" />

            {/* Static context card */}
            <div className="relative w-full max-w-sm rounded-xl border border-border/70 bg-card p-5 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="size-4 text-primary" />
                </div>
                <span className="text-sm font-semibold">Ask the AI Coach anything</span>
              </div>
              <div className="space-y-2">
                {[
                  'Can I afford a ₹70,000 laptop next month?',
                  'Why did my expenses increase last week?',
                  'Am I on track for my travel goal?',
                ].map((q) => (
                  <div
                    key={q}
                    className="rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors cursor-default"
                  >
                    {q}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
