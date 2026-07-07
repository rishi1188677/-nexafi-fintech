'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CalendarClock,
  Target,
  Lightbulb,
  BarChart3,
  ShoppingCart,
  Wallet,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Loader2,
  TriangleAlert,
  Bot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BriefingFacts } from '@/lib/ai/briefing-builder'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface BriefingSections {
  greeting: string
  cashflowSummary: string
  spendingInsight: string
  budgetAlert: string
  goalUpdate: string
  upcomingBills: string
  suggestedActions: string
  disclaimer: string
}

interface BriefingData {
  sections: BriefingSections
  facts: BriefingFacts
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const

function RenderBold({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-foreground">
            {p}
          </strong>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  )
}

function ToolBadge({ label }: { label: string }) {
  const iconMap: Record<string, React.ElementType> = {
    'Cashflow Tool': TrendingUp,
    'Spending Analysis Tool': ShoppingCart,
    'Trend Tool': BarChart3,
    'Budget Tool': Wallet,
    'Goal Tracking Tool': Target,
    'Recurring Tool': CalendarClock,
  }
  const Icon = iconMap[label] ?? CheckCircle2
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      <Icon className="size-2.5" />
      {label}
    </span>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
  accent = 'text-primary',
  borderAccent,
  delay = 0,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  accent?: string
  borderAccent?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      className={cn(
        'rounded-xl border border-border/70 bg-card p-5 shadow-sm',
        borderAccent && `border-l-2 ${borderAccent}`
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background', accent)}>
          <Icon className="size-3.5" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="text-sm leading-relaxed text-foreground/85">{children}</div>
    </motion.div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function BriefingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="size-7 rounded-lg bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-muted/60" />
            <div className="h-3 w-4/5 rounded bg-muted/60" />
            <div className="h-3 w-3/5 rounded bg-muted/50" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function DailyBriefingCard() {
  const [data, setData] = React.useState<BriefingData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchBriefing = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Pull recurring prefs from localStorage
      let recurringPrefs = {}
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`nexafi::recurring::user`)
          if (stored) recurringPrefs = JSON.parse(stored)
        } catch {}
      }

      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recurringPrefs }),
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load your briefing.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchBriefing()
  }, [fetchBriefing])

  const now = new Date()
  const hour = now.getHours()
  const timeGreeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page header */}
      <motion.div
        className="flex items-start justify-between gap-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
              <Sun className="size-4 text-amber-500" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">
                Good {timeGreeting} — here's your money update
              </h1>
              <p className="text-xs text-muted-foreground">{dateStr}</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBriefing}
          disabled={loading}
          className="shrink-0 gap-1.5"
        >
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </motion.div>

      {/* Error state */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-4"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">Couldn't load your briefing</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
            <button
              onClick={fetchBriefing}
              className="mt-2 text-xs font-medium text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && <BriefingSkeleton />}

      {/* Content */}
      {data && !loading && (
        <AnimatePresence mode="wait">
          <motion.div key="briefing" className="space-y-4">

            {/* Greeting + AI source badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/6 via-primary/4 to-transparent p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <Bot className="size-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  NexaFi AI Coach · Daily Briefing
                </span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-2.5" /> Verified data
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                <RenderBold text={data.sections.greeting || 'Your daily financial briefing is ready.'} />
              </p>
            </motion.div>

            {/* Cashflow snapshot — inline numbers */}
            <SectionCard icon={TrendingUp} title="Monthly Cashflow" accent="text-primary" borderAccent="border-l-primary" delay={0.05}>
              <div className="mb-3 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/60 bg-background/60 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Income</p>
                  <p className="mt-0.5 text-sm font-bold tabnum text-primary">{formatINR(data.facts.totalIncome)}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/60 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Expenses</p>
                  <p className="mt-0.5 text-sm font-bold tabnum">{formatINR(data.facts.totalExpenses)}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/60 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Net saved</p>
                  <p className={cn('mt-0.5 text-sm font-bold tabnum', data.facts.netSavings >= 0 ? 'text-primary' : 'text-destructive')}>
                    {data.facts.netSavings >= 0 ? '+' : ''}{formatINR(data.facts.netSavings)}
                  </p>
                </div>
              </div>
              {/* Savings rate bar */}
              <div className="flex items-center gap-2">
                <Progress value={Math.min(100, Math.max(0, data.facts.savingsRate))} className="h-1.5 flex-1" />
                <span className="text-[10px] font-semibold tabnum text-primary">{data.facts.savingsRate}% saved</span>
              </div>
              {data.facts.prevMonthExpenses > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  {data.facts.expenseChange >= 0
                    ? <TrendingUp className="size-3 text-destructive" />
                    : <TrendingDown className="size-3 text-primary" />}
                  <span>
                    Expenses {data.facts.expenseChange >= 0 ? 'up' : 'down'}{' '}
                    <strong className="tabnum">{Math.abs(data.facts.expenseChangePct)}%</strong> vs last month
                  </span>
                </div>
              )}
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                <RenderBold text={data.sections.cashflowSummary} />
              </p>
            </SectionCard>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Spending insight */}
              <SectionCard icon={ShoppingCart} title="Spending Insight" accent="text-blue-500" delay={0.1}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Top category</span>
                  <span className="font-semibold tabnum">{data.facts.topCategory} · {formatINR(data.facts.topCategoryAmount)}</span>
                </div>
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Biggest merchant</span>
                  <span className="font-semibold tabnum">{data.facts.biggestMerchant} · {formatINR(data.facts.biggestMerchantAmount)}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  <RenderBold text={data.sections.spendingInsight} />
                </p>
              </SectionCard>

              {/* Budget alert */}
              <SectionCard
                icon={AlertTriangle}
                title="Budget Status"
                accent={data.facts.overBudgets.length > 0 ? 'text-destructive' : data.facts.nearBudgets.length > 0 ? 'text-amber-500' : 'text-primary'}
                borderAccent={data.facts.overBudgets.length > 0 ? 'border-l-destructive' : data.facts.nearBudgets.length > 0 ? 'border-l-amber-500' : undefined}
                delay={0.12}
              >
                {/* Over-budget pills */}
                {data.facts.overBudgets.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {data.facts.overBudgets.map(b => (
                      <span key={b.category} className="rounded-full border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                        {b.label} exceeded
                      </span>
                    ))}
                  </div>
                )}
                {data.facts.nearBudgets.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {data.facts.nearBudgets.map(b => (
                      <span key={b.category} className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                        {b.label} {Math.round(b.ratio * 100)}%
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Safe-to-spend remaining: <strong className="tabnum">{formatINR(data.facts.safeToSpend)}</strong>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  <RenderBold text={data.sections.budgetAlert} />
                </p>
              </SectionCard>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Goal update */}
              <SectionCard icon={Target} title="Goals Progress" accent="text-rose-500" delay={0.15}>
                {data.facts.goals.length > 0 ? (
                  <div className="mb-3 space-y-3">
                    {data.facts.goals.slice(0, 3).map(g => (
                      <div key={g.id}>
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                          <span className="font-medium truncate">{g.title}</span>
                          <span className="ml-2 shrink-0 font-bold tabnum text-foreground">{g.pct}%</span>
                        </div>
                        <Progress value={g.pct} className="h-1.5" />
                        <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
                          <span>{formatINR(g.current)}</span>
                          <span>{formatINR(g.target)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                <p className="text-sm leading-relaxed text-foreground/80">
                  <RenderBold text={data.sections.goalUpdate} />
                </p>
              </SectionCard>

              {/* Upcoming bills */}
              <SectionCard icon={CalendarClock} title="Upcoming Bills" accent="text-violet-500" delay={0.18}>
                {data.facts.upcomingBills.length > 0 ? (
                  <div className="mb-3 space-y-2">
                    {data.facts.upcomingBills.slice(0, 4).map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-medium">{b.merchant}</span>
                          <span className="ml-2 text-muted-foreground">· {b.dueDate}</span>
                        </div>
                        <span className="font-semibold tabnum">{formatINR(b.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border/40 pt-1.5 text-[10px] text-muted-foreground">
                      Total recurring/month: <strong className="tabnum">{formatINR(data.facts.recurringMonthlyExpense)}</strong>
                    </div>
                  </div>
                ) : null}
                <p className="text-sm leading-relaxed text-foreground/80">
                  <RenderBold text={data.sections.upcomingBills} />
                </p>
              </SectionCard>
            </div>

            {/* Suggested actions */}
            <SectionCard icon={Lightbulb} title="Suggested Actions" accent="text-amber-500" borderAccent="border-l-amber-500" delay={0.22}>
              <div className="space-y-2">
                {data.sections.suggestedActions
                  .split(/\n/)
                  .filter(l => l.trim())
                  .map((line, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        <RenderBold text={line.replace(/^\d+\.\s*/, '')} />
                      </p>
                    </div>
                  ))}
              </div>
            </SectionCard>

            {/* Tools used */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
              className="flex flex-wrap items-center gap-1.5"
            >
              <span className="text-[10px] text-muted-foreground/60 mr-1">Analyzed using:</span>
              {data.facts.toolsUsed.map(t => <ToolBadge key={t} label={t} />)}
            </motion.div>

            {/* Disclaimer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="text-[10px] italic text-muted-foreground/50 border-t border-border/30 pt-3"
            >
              {data.sections.disclaimer || 'This briefing is for educational purposes only. All figures are based on transactions recorded in NexaFi.'}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

// ─── Compact widget for main dashboard ────────────────────────────────────────

export function DailyBriefingWidget() {
  const [greeting, setGreeting] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/ai/briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recurringPrefs: {} }),
        })
        if (!res.ok) throw new Error()
        const json = await res.json()
        setGreeting(json.sections?.greeting ?? null)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
            <Sun className="size-3.5 text-amber-500" />
          </div>
          <span className="text-xs font-semibold">Daily AI Briefing</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[9px] font-semibold text-primary">
          <Bot className="size-2.5" /> AI
        </span>
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-4/5 rounded bg-muted/70" />
        </div>
      )}

      {error && !loading && (
        <p className="text-xs text-muted-foreground">Briefing unavailable — check your API key.</p>
      )}

      {greeting && !loading && (
        <p className="text-xs leading-relaxed text-foreground/80 line-clamp-3">
          <RenderBold text={greeting} />
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-primary hover:bg-primary/8"
          nativeButton={false}
          render={<Link href="/dashboard/briefing" />}
        >
          View full briefing
          <ArrowRight className="size-3" />
        </Button>
      </div>
    </div>
  )
}
