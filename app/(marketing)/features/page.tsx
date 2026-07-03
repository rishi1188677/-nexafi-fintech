import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/marketing/reveal'
import { DashboardPreview } from '@/components/marketing/dashboard-preview'
import { features } from '@/components/marketing/features-data'

export const metadata: Metadata = {
  title: 'Features — NexaFi',
  description:
    'Smart spending insights, budgets, savings goals, cash-flow forecasting, subscription tracking, and a financial health score.',
}

export default function FeaturesPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              Features
            </span>
            <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Every tool you need to feel in control of your money
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              NexaFi brings spending, budgets, goals, and forecasting into a single
              calm workspace — designed to be understood at a glance.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.05}>
                <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h2 className="mt-5 text-base font-medium">{f.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
          <Reveal>
            <div>
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Built to be glanced at, trusted, and acted on
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Every screen is designed around a single question: what should I do
                next? NexaFi keeps the numbers precise and the guidance human.
              </p>
              <div className="mt-8">
                <Button size="lg" className="h-11 px-5" nativeButton={false} render={<Link href="/get-started" />}>
                  Start managing smarter
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <DashboardPreview />
          </Reveal>
        </div>
      </section>
    </>
  )
}
