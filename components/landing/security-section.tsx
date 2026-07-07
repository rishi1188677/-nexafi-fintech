'use client'

import { motion } from 'framer-motion'
import { Lock, ShieldCheck, Eye, Server, KeyRound, Database } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const securityItems = [
  {
    icon: Lock,
    title: 'Encrypted in transit & at rest',
    body: 'All data moves over TLS 1.3 and is stored with AES-256 encryption. Your numbers are never in plaintext.',
  },
  {
    icon: ShieldCheck,
    title: 'Row-level security (RLS)',
    body: 'Supabase RLS ensures your data is only ever accessible to your own authenticated session — at the database layer.',
  },
  {
    icon: Eye,
    title: 'Zero third-party data sharing',
    body: 'Your transaction history is never shared with advertisers, brokers, or sold to any third party.',
  },
  {
    icon: KeyRound,
    title: 'Secure authentication',
    body: 'Powered by Supabase Auth with email + OAuth flows. API keys are server-only and never exposed to clients.',
  },
  {
    icon: Database,
    title: 'You own your data',
    body: 'Export or delete your data at any time. We do not retain data after account deletion.',
  },
  {
    icon: Server,
    title: 'Serverless & edge-deployed',
    body: 'Deployed on Vercel Edge Network with isolated server functions. No single point of failure.',
  },
]

export function SecuritySection() {
  return (
    <section className="relative border-b border-border/60 bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-radial-glow opacity-50" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card ring-1 ring-foreground/5">

          {/* Header band */}
          <div className="relative border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 px-8 py-10 sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
            <motion.div
              className="relative max-w-2xl"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex size-12 items-center justify-center rounded-xl border border-border bg-background text-primary shadow-sm">
                <Lock className="size-5" />
              </span>
              <h2 className="mt-5 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                Your financial data is designed to remain{' '}
                <span className="text-primary">private, secure, and under your control.</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Security isn't a feature we bolted on — it's the architectural foundation of everything NexaFi does.
              </p>
            </motion.div>
          </div>

          {/* Security grid */}
          <div className="grid gap-px bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
            {securityItems.map((item, i) => (
              <motion.div
                key={item.title}
                className="bg-card p-6"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <item.icon className="size-4 text-primary" />
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex items-center justify-between gap-4 border-t border-border/60 px-8 py-5 sm:px-12">
            <p className="text-sm text-muted-foreground">
              Want to know the full architecture?
            </p>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              nativeButton={false}
              render={<Link href="/security" />}
            >
              Read security docs
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
