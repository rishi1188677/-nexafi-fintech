import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Check,
  Lock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardPreview } from '@/components/marketing/dashboard-preview'
import { Reveal } from '@/components/marketing/reveal'
import { features } from '@/components/marketing/features-data'

const trustBadges = [
  'Bank-grade encryption in transit',
  'You own your data',
  'No card required to explore',
]

const metrics = [
  { value: '₹1.2L+', label: 'Tracked in demo balance' },
  { value: '82/100', label: 'Average health score' },
  { value: '6 months', label: 'Cash-flow forecasting' },
  { value: '38%', label: 'Typical savings rate' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-24">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Financial intelligence for young professionals
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 text-pretty text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Understand your money. Build your future.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                NexaFi turns everyday financial activity into clear insights,
                smarter budgets, and better decisions.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-11 px-5 text-sm" nativeButton={false} render={<Link href="/get-started" />}>
                  Start managing smarter
                  <ArrowRight className="size-4" />
                </Button>
                <Button variant="outline" size="lg" className="h-11 px-5 text-sm" nativeButton={false} render={<Link href="/product" />}>
                  Explore the platform
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <ul className="mt-8 flex flex-col gap-2.5">
                {trustBadges.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <DashboardPreview />
          </Reveal>
        </div>
      </section>

      {/* Metrics band */}
      <section className="border-b border-border/70">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="px-2 py-8 text-center lg:py-10">
              <p className="text-2xl font-semibold tabnum tracking-tight lg:text-3xl">
                {m.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <span className="text-xs font-medium uppercase tracking-wider text-primary">
                Everything in one place
              </span>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                A calmer way to run your financial life
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                Seven connected tools that work together — from daily spending to
                long-term goals — without the noise of a typical finance app.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.05}>
                <div className="group h-full rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5 transition-colors hover:border-primary/40">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-base font-medium">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Split: insights */}
      <section className="border-b border-border/70">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
                <BarChart3 className="size-4" /> Insights that make sense
              </span>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Plain-language guidance, not another dashboard to decode
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                NexaFi watches for the things that actually move your finances —
                spending spikes, forgotten subscriptions, and projected balances —
                and explains them in a sentence.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  'Your dining expenses are 18% above your usual monthly average.',
                  'Three recurring subscriptions are costing ₹1,247 each month.',
                  'Your projected month-end balance is ₹18,600.',
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                  >
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-sm leading-relaxed text-foreground/90">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <DashboardPreview />
          </Reveal>
        </div>
      </section>

      {/* Security teaser */}
      <section className="border-b border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <div className="rounded-2xl border border-border bg-card p-8 ring-1 ring-foreground/5 sm:p-12">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
                <div>
                  <span className="inline-flex size-11 items-center justify-center rounded-lg border border-border bg-background text-primary">
                    <Lock className="size-5" />
                  </span>
                  <h2 className="mt-5 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                    Your financial information is designed to remain private, secure,
                    and under your control.
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { t: 'Encrypted data', d: 'Protected in transit and at rest.' },
                    { t: 'Privacy controls', d: 'You decide what is stored.' },
                    { t: 'Secure sign-in', d: 'Modern authentication by design.' },
                  ].map((c) => (
                    <div key={c.t} className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm font-medium">{c.t}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/security" />}>
                  Read our security approach
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Start understanding your money today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              Explore the full NexaFi experience with a realistic demo workspace. No
              card, no bank connection, no risk.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-11 px-6" nativeButton={false} render={<Link href="/get-started" />}>
                Start managing smarter
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" size="lg" className="h-11 px-6" nativeButton={false} render={<Link href="/dashboard" />}>
                Open live demo
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
