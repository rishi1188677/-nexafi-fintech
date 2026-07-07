'use client'

import { motion } from 'framer-motion'
import {
  Sun,
  TrendingUp,
  AlertTriangle,
  CalendarClock,
  Target,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

const MOCK_BRIEFING = {
  greeting: 'Good morning — here\'s your money update',
  date: 'Monday, 7 July 2026',
  cashflow: {
    income: '₹48,000',
    expenses: '₹29,480',
    net: '+₹18,520',
    savingsRate: '39%',
    trend: 'up',
  },
  alert: {
    title: 'Shopping budget at 94%',
    body: '8 days left in July. Avoid large purchases to stay within your ₹6,000 limit.',
    severity: 'warning',
  },
  upcomingBill: {
    merchant: 'Netflix',
    date: 'Jul 12',
    amount: '₹649',
  },
  goal: {
    title: 'Emergency Fund',
    pct: 68,
    remaining: '₹32,000',
    eta: 'Nov 2026',
  },
  suggestion: 'Redirecting your unused ₹1,247 subscription to your Travel Fund would get you there 2 months early.',
}

interface BriefingCardProps {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  accent?: string
  delay?: number
}

function BriefingCard({ icon: Icon, label, children, accent = 'text-primary', delay = 0 }: BriefingCardProps) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl bg-gradient-to-br from-primary/4 to-transparent" />
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('size-3.5', accent)} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="text-sm leading-relaxed text-foreground/85">{children}</div>
    </motion.div>
  )
}

export function DailyBriefingTeaser() {
  const b = MOCK_BRIEFING

  return (
    <section className="relative border-b border-border/60 bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-radial-glow opacity-50" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">

        {/* Section header */}
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/8 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Sun className="size-3" />
            Daily AI Briefing
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Start every morning knowing exactly where you stand
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            NexaFi scans your data overnight and surfaces what actually matters — no noise, no clutter.
          </p>
        </motion.div>

        {/* Briefing card container */}
        <motion.div
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {/* Outer glow */}
          <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-primary/6 blur-3xl" />

          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl shadow-black/10">

            {/* Briefing header bar */}
            <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/8 via-transparent to-amber-500/6 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
                  <Sun className="size-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{b.greeting}</p>
                  <p className="text-[11px] text-muted-foreground">{b.date}</p>
                </div>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 sm:inline-flex">
                <CheckCircle2 className="size-3" />
                All systems nominal
              </span>
            </div>

            {/* Grid of briefing cards */}
            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">

              {/* Cashflow snapshot */}
              <BriefingCard icon={TrendingUp} label="Monthly cashflow" accent="text-primary" delay={0.05}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Income</span>
                    <span className="font-semibold tabnum text-primary">{b.cashflow.income}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Expenses</span>
                    <span className="font-semibold tabnum">{b.cashflow.expenses}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
                    <span className="text-xs font-semibold">Net saved</span>
                    <span className="text-sm font-bold tabnum text-primary">{b.cashflow.net}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[39%] rounded-full bg-primary" />
                  </div>
                  <span className="text-[10px] font-bold tabnum text-primary">{b.cashflow.savingsRate} saved</span>
                </div>
              </BriefingCard>

              {/* Spending alert */}
              <BriefingCard icon={AlertTriangle} label="Spending alert" accent="text-amber-500" delay={0.1}>
                <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">{b.alert.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{b.alert.body}</p>
              </BriefingCard>

              {/* Upcoming bill */}
              <BriefingCard icon={CalendarClock} label="Upcoming bill" accent="text-blue-500" delay={0.15}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{b.upcomingBill.merchant}</p>
                    <p className="text-xs text-muted-foreground">Due {b.upcomingBill.date}</p>
                  </div>
                  <span className="text-lg font-bold tabnum text-foreground">{b.upcomingBill.amount}</span>
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">Auto-detected recurring subscription</p>
              </BriefingCard>

              {/* Goal progress */}
              <BriefingCard icon={Target} label="Goal progress" accent="text-rose-500" delay={0.2}>
                <p className="font-semibold mb-2">{b.goal.title}</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-rose-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${b.goal.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                  <span>{b.goal.pct}% complete</span>
                  <span>{b.goal.remaining} remaining · {b.goal.eta}</span>
                </div>
              </BriefingCard>

              {/* Suggested action — spans 2 cols on lg */}
              <div className="sm:col-span-2 lg:col-span-2">
                <BriefingCard icon={Lightbulb} label="Suggested action" accent="text-violet-500" delay={0.25}>
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                      <Lightbulb className="size-4 text-violet-500" />
                    </div>
                    <p className="text-sm leading-relaxed">{b.suggestion}</p>
                  </div>
                </BriefingCard>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="flex items-center justify-between border-t border-border/60 bg-background/40 px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Using mock data for demo · Sign in to see your real briefing
              </p>
              <Button
                size="sm"
                className="gap-1.5 shadow-sm shadow-primary/20"
                nativeButton={false}
                render={<Link href="/sign-up" />}
              >
                Get my briefing
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
