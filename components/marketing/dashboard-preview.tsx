import {
  ArrowUpRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Total balance', value: '₹1,24,850', delta: '+4.2%', up: true },
  { label: 'Monthly income', value: '₹48,000', delta: '+0.0%', up: true },
  { label: 'Monthly expenses', value: '₹29,480', delta: '-3.7%', up: false },
]

const flow = [31200, 33800, 41500, 28900, 30600, 29480]
const income = [48000, 52000, 60000, 48000, 60000, 48000]

const recent = [
  { m: 'Zomato', c: 'Food & Dining', a: '-₹742' },
  { m: 'Salary Credit', c: 'Income', a: '+₹48,000', pos: true },
  { m: 'Amazon', c: 'Shopping', a: '-₹1,899' },
]

function AreaChart() {
  const w = 320
  const h = 96
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
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pv-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#pv-fill)" />
      <path d={toPath(inc)} fill="none" stroke="var(--chart-2)" strokeWidth="2" />
      <path d={toPath(exp)} fill="none" stroke="var(--chart-1)" strokeWidth="2" />
    </svg>
  )
}

function ScoreRing() {
  const r = 26
  const c = 2 * Math.PI * r
  const pct = 82
  return (
    <div className="relative flex size-[68px] items-center justify-center">
      <svg viewBox="0 0 64 64" className="size-[68px] -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
        />
      </svg>
      <span className="absolute text-sm font-semibold tabnum">{pct}</span>
    </div>
  )
}

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40 ring-1 ring-foreground/10',
        className,
      )}
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-border/70 bg-background/60 px-4 py-3">
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="ml-3 text-xs text-muted-foreground">NexaFi · Overview</span>
      </div>

      <div className="grid gap-4 p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border/70 bg-background/40 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Wallet className="size-3" />
                <span className="truncate">{s.label}</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold tabnum sm:text-base">{s.value}</p>
              <span
                className={cn(
                  'mt-1 inline-flex items-center gap-0.5 text-[10px] tabnum',
                  s.up ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {s.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {s.delta}
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
          <div className="rounded-lg border border-border/70 bg-background/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium">Cash flow</span>
              <span className="text-[10px] text-muted-foreground">Last 6 months</span>
            </div>
            <AreaChart />
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/40 p-3">
            <ScoreRing />
            <div>
              <p className="text-[11px] text-muted-foreground">Health score</p>
              <p className="text-sm font-semibold">Strong</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Top 20% for your age</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-background/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium">Recent activity</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-primary">
              <Sparkles className="size-3" /> AI insights
            </span>
          </div>
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.m} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md bg-muted text-[10px] font-medium">
                    {r.m[0]}
                  </span>
                  <div className="leading-tight">
                    <p className="text-[11px] font-medium">{r.m}</p>
                    <p className="text-[10px] text-muted-foreground">{r.c}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium tabnum',
                    r.pos ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {r.a}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 p-3">
          <Sparkles className="size-4 shrink-0 text-primary" />
          <p className="text-[11px] leading-relaxed text-foreground/90">
            You are on track to save <span className="font-semibold">₹15,200</span> this
            month.
          </p>
          <ArrowUpRight className="ml-auto size-3.5 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}
