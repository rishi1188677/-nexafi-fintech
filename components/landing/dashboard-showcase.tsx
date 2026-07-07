'use client'

import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Bot,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Target,
  CalendarClock,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Total balance', value: '₹1,24,850', delta: '+4.2%', up: true },
  { label: 'Monthly income', value: '₹48,000', delta: '+0.0%', up: true },
  { label: 'Monthly expenses', value: '₹29,480', delta: '-3.7%', up: false },
]

const flow = [31200, 33800, 41500, 28900, 30600, 29480]
const income = [48000, 52000, 60000, 48000, 60000, 48000]

const recentTxs = [
  { m: 'Zomato', c: 'Food & Dining', a: '-₹742', pos: false },
  { m: 'Salary Credit', c: 'Income', a: '+₹48,000', pos: true },
  { m: 'Amazon', c: 'Shopping', a: '-₹1,899', pos: false },
  { m: 'Netflix', c: 'Subscriptions', a: '-₹649', pos: false },
]

const goals = [
  { title: 'Emergency Fund', pct: 68, color: 'var(--chart-1)' },
  { title: 'Travel Fund', pct: 42, color: 'var(--chart-2)' },
]

function AreaChart() {
  const w = 300
  const h = 80
  const max = Math.max(...income)
  const min = Math.min(...flow) * 0.85
  const pts = (arr: number[]) =>
    arr.map((v, i) => {
      const x = (i / (arr.length - 1)) * w
      const y = h - ((v - min) / (max - min)) * h
      return [x, y] as const
    })
  const toPath = (p: readonly (readonly [number, number])[]) =>
    p.map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(' ')
  const inc = pts(income)
  const exp = pts(flow)
  const area = `${toPath(exp)} L${w},${h} L0,${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ds-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ds-fill)" />
      <path d={toPath(inc)} fill="none" stroke="var(--chart-2)" strokeWidth="1.5" />
      <path d={toPath(exp)} fill="none" stroke="var(--chart-1)" strokeWidth="1.5" />
    </svg>
  )
}

function ScoreRing({ score = 82 }: { score?: number }) {
  const r = 22
  const c = 2 * Math.PI * r
  return (
    <div className="relative flex size-[56px] items-center justify-center">
      <svg viewBox="0 0 52 52" className="size-[56px] -rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
        />
      </svg>
      <span className="absolute text-xs font-bold tabnum">{score}</span>
    </div>
  )
}

export function DashboardShowcase() {
  return (
    <section className="relative border-b border-border/60 bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">

        {/* Section header */}
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Product Preview
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Every financial signal, beautifully organized
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            From daily spending to long-term goals — your entire financial life in one premium command center.
          </p>
        </motion.div>

        {/* Main browser chrome mockup */}
        <motion.div
          className="relative mx-auto w-full max-w-5xl"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Glow behind the card */}
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-primary/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl shadow-black/30 ring-1 ring-foreground/10">
            {/* Browser chrome bar */}
            <div className="flex items-center gap-2 border-b border-border/60 bg-background/60 px-5 py-3.5 backdrop-blur-sm">
              <span className="size-3 rounded-full bg-red-400/70" />
              <span className="size-3 rounded-full bg-amber-400/70" />
              <span className="size-3 rounded-full bg-emerald-400/70" />
              <div className="ml-4 flex-1 rounded-md bg-muted/60 px-3 py-1 text-[11px] text-muted-foreground/80">
                nexafi.app/dashboard
              </div>
              <ShieldCheck className="size-3.5 text-primary/60" />
            </div>

            {/* Dashboard layout */}
            <div className="grid gap-3 p-4 lg:grid-cols-[1fr_280px] lg:p-5">
              {/* Left main column */}
              <div className="flex flex-col gap-3">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2.5">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-border/60 bg-background/50 p-3 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Wallet className="size-3 shrink-0" />
                        <span className="truncate">{s.label}</span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold tabnum">{s.value}</p>
                      <span className={cn('mt-0.5 inline-flex items-center gap-0.5 text-[10px] tabnum', s.up ? 'text-primary' : 'text-muted-foreground')}>
                        {s.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {s.delta}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Chart + health */}
                <div className="grid gap-2.5 sm:grid-cols-[1.6fr_1fr]">
                  <div className="rounded-xl border border-border/60 bg-background/50 p-3 backdrop-blur-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-medium">Cash flow</span>
                      <span className="text-[10px] text-muted-foreground">6 months</span>
                    </div>
                    <AreaChart />
                    <div className="mt-1.5 flex items-center gap-3 text-[9px] text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-chart-2" />Income</span>
                      <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-chart-1" />Expenses</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3 backdrop-blur-sm">
                    <ScoreRing />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Health score</p>
                      <p className="text-sm font-semibold">Strong</p>
                      <p className="mt-0.5 text-[9px] text-primary">Top 20% for your age</p>
                    </div>
                  </div>
                </div>

                {/* Recent transactions */}
                <div className="rounded-xl border border-border/60 bg-background/50 p-3 backdrop-blur-sm">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-medium">Recent transactions</span>
                    <span className="inline-flex items-center gap-1 text-[9px] text-primary">
                      <Sparkles className="size-2.5" /> AI insights
                    </span>
                  </div>
                  <div className="space-y-2">
                    {recentTxs.map((tx) => (
                      <div key={tx.m} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-lg bg-muted text-[9px] font-bold text-foreground/70">
                            {tx.m[0]}
                          </span>
                          <div className="leading-tight">
                            <p className="text-[11px] font-medium">{tx.m}</p>
                            <p className="text-[9px] text-muted-foreground">{tx.c}</p>
                          </div>
                        </div>
                        <span className={cn('text-[11px] font-semibold tabnum', tx.pos ? 'text-primary' : 'text-foreground')}>
                          {tx.a}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI insight bar */}
                <div className="flex items-center gap-2.5 rounded-xl border border-primary/25 bg-primary/8 p-3">
                  <Bot className="size-4 shrink-0 text-primary" />
                  <p className="text-[11px] leading-snug text-foreground/90">
                    You are on track to save <span className="font-semibold text-primary">₹15,200</span> this month.
                    Your grocery spend is down <span className="font-semibold">12%</span> vs. last month.
                  </p>
                  <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
                </div>
              </div>

              {/* Right sidebar panel */}
              <div className="flex flex-col gap-3">
                {/* Goals */}
                <div className="rounded-xl border border-border/60 bg-background/50 p-3 backdrop-blur-sm">
                  <div className="mb-2.5 flex items-center gap-1.5">
                    <Target className="size-3 text-primary" />
                    <span className="text-[11px] font-medium">Savings goals</span>
                  </div>
                  <div className="space-y-3">
                    {goals.map((g) => (
                      <div key={g.title}>
                        <div className="mb-1 flex items-center justify-between text-[10px]">
                          <span className="text-foreground/80">{g.title}</span>
                          <span className="font-medium tabnum text-foreground">{g.pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${g.pct}%`, background: g.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming bills */}
                <div className="rounded-xl border border-border/60 bg-background/50 p-3 backdrop-blur-sm">
                  <div className="mb-2.5 flex items-center gap-1.5">
                    <CalendarClock className="size-3 text-primary" />
                    <span className="text-[11px] font-medium">Upcoming bills</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Netflix', date: 'Jul 12', amt: '₹649' },
                      { name: 'Gym', date: 'Jul 15', amt: '₹1,200' },
                      { name: 'Rent', date: 'Jul 1', amt: '₹14,000' },
                    ].map((b) => (
                      <div key={b.name} className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-medium">{b.name}</p>
                          <p className="text-[9px] text-muted-foreground">{b.date}</p>
                        </div>
                        <span className="text-[11px] font-semibold tabnum text-foreground/80">{b.amt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget status pills */}
                <div className="rounded-xl border border-border/60 bg-background/50 p-3 backdrop-blur-sm">
                  <span className="mb-2 block text-[11px] font-medium">Budget health</span>
                  <div className="space-y-1.5">
                    {[
                      { cat: 'Food & Dining', pct: 71, ok: true },
                      { cat: 'Shopping', pct: 94, ok: false },
                      { cat: 'Transport', pct: 48, ok: true },
                    ].map((b) => (
                      <div key={b.cat} className="flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn('h-full rounded-full', b.ok ? 'bg-chart-1' : 'bg-destructive')}
                            style={{ width: `${b.pct}%` }}
                          />
                        </div>
                        <span className={cn('w-8 text-right text-[9px] tabnum font-medium', b.ok ? 'text-primary' : 'text-destructive')}>{b.pct}%</span>
                        <span className="w-24 truncate text-[9px] text-muted-foreground">{b.cat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
