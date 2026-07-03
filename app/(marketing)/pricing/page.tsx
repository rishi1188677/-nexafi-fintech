import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/marketing/reveal'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Pricing — NexaFi',
  description: 'Simple, transparent pricing for NexaFi. Start free and upgrade when you are ready.',
}

const plans = [
  {
    name: 'Starter',
    price: '₹0',
    cadence: 'forever',
    description: 'Everything you need to understand your spending.',
    cta: 'Start for free',
    href: '/get-started',
    featured: false,
    features: [
      'Spending insights',
      'Up to 3 budgets',
      '1 savings goal',
      '3 months of history',
      'Financial health score',
    ],
  },
  {
    name: 'Plus',
    price: '₹299',
    cadence: 'per month',
    description: 'For professionals who want the full picture.',
    cta: 'Start managing smarter',
    href: '/get-started',
    featured: true,
    features: [
      'Unlimited budgets & goals',
      'Cash-flow forecasting',
      'Subscription detection',
      'AI financial assistant',
      'Unlimited history & CSV import',
    ],
  },
  {
    name: 'Wealth',
    price: '₹699',
    cadence: 'per month',
    description: 'Advanced planning for growing net worth.',
    cta: 'Talk to us',
    href: '/get-started',
    featured: false,
    features: [
      'Everything in Plus',
      'Net-worth tracking',
      'Advanced anomaly detection',
      'Multi-account modelling',
      'Priority support',
    ],
  },
]

const faqs = [
  {
    q: 'Is this a real bank?',
    a: 'No. NexaFi is a product experience demo. It does not hold deposits or connect to real financial accounts.',
  },
  {
    q: 'Do I need a card to start?',
    a: 'No card is required to explore the demo workspace. You can open the dashboard instantly.',
  },
  {
    q: 'Is my data used for advice?',
    a: 'Insights are educational and designed to help you understand your money. They are not financial advice.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Plans are month-to-month and you can change or cancel whenever you like.',
  },
]

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              Pricing
            </span>
            <h1 className="mx-auto mt-3 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Simple pricing that grows with you
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Start free and upgrade when you are ready for forecasting, AI, and
              unlimited history.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.05}>
                <div
                  className={cn(
                    'flex h-full flex-col rounded-2xl border bg-card p-8 ring-1 ring-foreground/5',
                    plan.featured
                      ? 'border-primary/50 ring-primary/20'
                      : 'border-border',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">{plan.name}</h2>
                    {plan.featured && (
                      <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                        Most popular
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-4xl font-semibold tabnum tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">/ {plan.cadence}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {plan.description}
                  </p>
                  <Button
                    variant={plan.featured ? 'default' : 'outline'}
                    className="mt-6 h-10"
                    nativeButton={false}
                    render={<Link href={plan.href} />}
                  >
                    {plan.cta}
                    <ArrowRight className="size-4" />
                  </Button>
                  <ul className="mt-8 space-y-3 border-t border-border pt-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
          </Reveal>
          <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-card ring-1 ring-foreground/5">
            {faqs.map((f) => (
              <div key={f.q} className="p-6">
                <h3 className="text-base font-medium">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
