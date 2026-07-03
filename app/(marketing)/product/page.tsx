import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  PieChart,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/marketing/reveal'
import { DashboardPreview } from '@/components/marketing/dashboard-preview'

export const metadata: Metadata = {
  title: 'Product overview — NexaFi',
  description:
    'A guided tour of the NexaFi product: overview, transactions, budgets, goals, insights, and the AI assistant.',
}

const modules = [
  {
    icon: LayoutDashboard,
    title: 'Overview',
    body: 'Balance, income, expenses, savings rate, and your financial health score — the whole picture in one screen.',
  },
  {
    icon: ListChecks,
    title: 'Transactions',
    body: 'Search, filter, and categorize every transaction. Add entries manually or import a CSV.',
  },
  {
    icon: PieChart,
    title: 'Budgets',
    body: 'Category budgets with real-time usage, remaining amounts, and subtle over-budget warnings.',
  },
  {
    icon: Target,
    title: 'Goals',
    body: 'Track savings goals with contributions and realistic estimated completion dates.',
  },
  {
    icon: TrendingUp,
    title: 'Insights',
    body: 'Trends, top merchants, recurring payments, anomalies, and a forecasted month-end balance.',
  },
  {
    icon: MessageSquareText,
    title: 'AI Assistant',
    body: 'Ask questions about your money and get clear, educational answers grounded in your data.',
  },
]

export default function ProductPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              Product overview
            </span>
            <h1 className="mx-auto mt-3 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              One platform, six connected workspaces
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              See how NexaFi fits together — from your daily transactions to
              long-term goals and AI-guided decisions.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto mt-12 max-w-3xl">
              <DashboardPreview />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, i) => (
              <Reveal key={m.title} delay={(i % 3) * 0.05}>
                <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
                    <m.icon className="size-5" />
                  </span>
                  <h2 className="mt-5 text-base font-medium">{m.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-11 px-6" nativeButton={false} render={<Link href="/dashboard" />}>
                Open the live demo
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" size="lg" className="h-11 px-6" nativeButton={false} render={<Link href="/pricing" />}>
                View pricing
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
