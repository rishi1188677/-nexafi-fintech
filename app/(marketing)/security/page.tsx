import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Eye,
  Fingerprint,
  KeyRound,
  Lock,
  ServerCog,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/marketing/reveal'

export const metadata: Metadata = {
  title: 'Security & privacy — NexaFi',
  description:
    'How NexaFi is designed to keep your financial information private, secure, and under your control.',
}

const pillars = [
  {
    icon: Lock,
    title: 'Encrypted data',
    body: 'Your information is designed to be protected with strong encryption in transit and at rest.',
  },
  {
    icon: Eye,
    title: 'Privacy controls',
    body: 'You decide what is stored and can review or remove your data whenever you choose.',
  },
  {
    icon: Fingerprint,
    title: 'Secure authentication',
    body: 'Modern sign-in designed to keep unauthorized access out of your account.',
  },
]

const practices = [
  {
    icon: UserCheck,
    title: 'You stay in control',
    body: 'Your financial information is designed to remain private, secure, and under your control at every step.',
  },
  {
    icon: ServerCog,
    title: 'Least-privilege by design',
    body: 'Systems are built to access only what is needed to deliver the insights you asked for.',
  },
  {
    icon: KeyRound,
    title: 'Thoughtful access',
    body: 'Sensitive actions are designed around clear, deliberate confirmation.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-first defaults',
    body: 'The safest, most private option is designed to be the default — not an afterthought.',
  },
]

export default function SecurityPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
        <div className="relative mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-24">
          <Reveal>
            <span className="inline-flex size-12 items-center justify-center rounded-xl border border-border bg-card text-primary">
              <ShieldCheck className="size-6" />
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Your financial information is designed to remain private, secure, and
              under your control.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Security is not a feature we bolt on at the end. It shapes how NexaFi
              is designed, from data handling to the smallest interaction.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.05}>
                <div className="h-full rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5">
                  <span className="inline-flex size-11 items-center justify-center rounded-lg border border-border bg-background text-primary">
                    <p.icon className="size-5" />
                  </span>
                  <h2 className="mt-5 text-lg font-medium">{p.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <Reveal>
            <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Principles that guide how we handle your data
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {practices.map((p, i) => (
              <Reveal key={p.title} delay={(i % 2) * 0.05}>
                <div className="flex gap-4 rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                    <p.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-medium">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-10 rounded-xl border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
              NexaFi is a product experience demo. It is not a bank, does not hold
              deposits, and does not connect to real financial accounts. Nothing here
              is a security certification or a guarantee, and this content is not
              financial advice.
            </div>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Explore NexaFi with total peace of mind
            </h2>
            <div className="mt-8">
              <Button size="lg" className="h-11 px-6" nativeButton={false} render={<Link href="/get-started" />}>
                Get started
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
