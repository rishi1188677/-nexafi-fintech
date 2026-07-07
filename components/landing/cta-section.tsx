'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { value: '₹1.2L+', label: 'Tracked in demo accounts' },
  { value: '82/100', label: 'Average health score' },
  { value: '9 tools', label: 'Integrated in one platform' },
  { value: '100%', label: 'Private — your data, your rules' },
]

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/8 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">

        {/* Stats band */}
        <motion.div
          className="mb-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 lg:grid-cols-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-card px-6 py-6 text-center">
              <p className="text-2xl font-semibold tabnum tracking-tight lg:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA block */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            No credit card required
          </span>

          <h2 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Start understanding your money today
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Explore the full NexaFi experience with a realistic demo workspace. Your data, your rules — no bank connection needed.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 gap-2 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base hover:bg-muted/60"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              Open Live Demo
            </Button>
          </div>

          <p className="mt-5 text-xs text-muted-foreground/60">
            Bank-grade encryption · Row-level security · No data selling, ever
          </p>
        </motion.div>
      </div>
    </section>
  )
}
