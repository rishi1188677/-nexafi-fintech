'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Bot,
  Brain,
  ArrowRight,
  CheckCircle2,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Target,
  BarChart3,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const FLOW_EASE = [0.22, 1, 0.36, 1] as const

interface ToolBadge {
  label: string
  color: string
  bg: string
  icon: React.ElementType
}

interface AgentStep {
  id: string
  step: number
  title: string
  description: string
  icon: React.ElementType
  accentColor: string
  tools?: ToolBadge[]
}

const AGENT_STEPS: AgentStep[] = [
  {
    id: 'question',
    step: 1,
    title: 'You ask a money question',
    description:
      'Type anything — "Can I afford a ₹1,20,000 trip?" or "Why did my expenses spike?" — in plain language.',
    icon: Bot,
    accentColor: 'text-violet-500',
    tools: [],
  },
  {
    id: 'tools',
    step: 2,
    title: 'Deterministic tools calculate facts first',
    description:
      'Before Gemini generates any text, specialised financial engines run hard maths on your real data.',
    icon: Brain,
    accentColor: 'text-primary',
    tools: [
      { label: 'Merchant Spending Tool', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: ShoppingCart },
      { label: 'Affordability Tool', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', icon: Wallet },
      { label: 'Trend Tool', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: TrendingUp },
      { label: 'Budget Tool', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: BarChart3 },
      { label: 'Goal Tracking Tool', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: Target },
    ],
  },
  {
    id: 'gemini',
    step: 3,
    title: 'Gemini explains the facts naturally',
    description:
      'Verified numbers are passed to Gemini Flash as structured context. It writes a clear, human-friendly answer — no hallucinations, no fabricated figures.',
    icon: Sparkles,
    accentColor: 'text-amber-500',
    tools: [],
  },
  {
    id: 'answer',
    step: 4,
    title: 'You get a transparent, cited answer',
    description:
      'The response always shows which tool produced the data — so you know exactly where every number comes from.',
    icon: CheckCircle2,
    accentColor: 'text-emerald-500',
    tools: [],
  },
]

const EXAMPLE_EXCHANGE = {
  question: 'Can I afford a ₹1,20,000 trip next year?',
  toolUsed: 'Affordability Tool',
  answer: `Based on your last 3 months, your **average monthly net savings** is **₹18,400**. After your existing goal contributions of **₹5,200/month**, your **disposable surplus** is roughly **₹13,200/month**.

**At this rate, you'd reach ₹1,20,000 in about 9 months** — right on schedule for next year.

**Observations:**
- Your shopping spend is currently at 94% of budget; trimming it could accelerate savings.
- One subscription (₹1,247/month) appears unused — cancelling it adds ~₹15,000 over 12 months.

**Suggestions:**
1. Set up a dedicated "Travel Fund" savings goal to track progress automatically.
2. Review the flagged subscription and redirect it to your trip fund.`,
}

export function AiAgentShowcase() {
  const [activeStep, setActiveStep] = useState(1)

  return (
    <section className="relative border-b border-border/60 bg-background overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-primary/4 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">

        {/* Header */}
        <motion.div
          className="mx-auto mb-14 max-w-2xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: FLOW_EASE }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
            <Brain className="size-3" />
            AI Agent 2.0
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            How NexaFi thinks before it speaks
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Unlike basic chatbots, NexaFi's AI Agent runs deterministic financial calculations before
            involving Gemini — so every answer is grounded in your real numbers.
          </p>
        </motion.div>

        {/* Main layout: steps left, preview right */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">

          {/* Left: interactive step list */}
          <div className="flex flex-col gap-3">
            {AGENT_STEPS.map((step, i) => {
              const isActive = activeStep === step.step
              const isDone = activeStep > step.step
              return (
                <motion.button
                  key={step.id}
                  onClick={() => setActiveStep(step.step)}
                  className={cn(
                    'group relative w-full overflow-hidden rounded-xl border p-5 text-left transition-all duration-300',
                    isActive
                      ? 'border-primary/40 bg-card shadow-md shadow-primary/8'
                      : isDone
                        ? 'border-border/50 bg-card/50 opacity-70 hover:opacity-90'
                        : 'border-border/40 bg-card/40 hover:border-border/70 hover:bg-card/70',
                  )}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: FLOW_EASE }}
                >
                  {/* Active left accent bar */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-primary"
                      layoutId="activeBar"
                      transition={{ duration: 0.3, ease: FLOW_EASE }}
                    />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Step number / icon */}
                    <div className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                      isActive ? 'border-primary/30 bg-primary/10' : 'border-border/50 bg-muted/50',
                    )}>
                      <step.icon className={cn('size-4', isActive ? step.accentColor : 'text-muted-foreground')} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-[10px] font-bold uppercase tracking-widest', isActive ? 'text-primary' : 'text-muted-foreground/60')}>
                          Step {step.step}
                        </span>
                        {isDone && <CheckCircle2 className="size-3 text-primary" />}
                      </div>
                      <p className={cn('mt-0.5 text-sm font-semibold', isActive ? 'text-foreground' : 'text-foreground/70')}>
                        {step.title}
                      </p>
                      {isActive && (
                        <motion.p
                          className="mt-1.5 text-xs leading-relaxed text-muted-foreground"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          {step.description}
                        </motion.p>
                      )}

                      {/* Tool badges for step 2 */}
                      {isActive && step.tools && step.tools.length > 0 && (
                        <motion.div
                          className="mt-3 flex flex-wrap gap-1.5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {step.tools.map((tool) => (
                            <span
                              key={tool.label}
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                                tool.bg,
                                tool.color,
                              )}
                            >
                              <tool.icon className="size-2.5" />
                              {tool.label}
                            </span>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    <ChevronRight className={cn('ml-auto size-4 shrink-0 transition-transform', isActive ? 'text-primary rotate-90' : 'text-muted-foreground/30')} />
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Right: live preview panel */}
          <motion.div
            className="sticky top-24"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.15, ease: FLOW_EASE }}
          >
            {/* Glow */}
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-primary/6 blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl shadow-black/10">
              {/* Chrome bar */}
              <div className="flex items-center gap-2 border-b border-border/60 bg-background/60 px-5 py-3 backdrop-blur-sm">
                <span className="size-2.5 rounded-full bg-red-400/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-4 text-[11px] text-muted-foreground">NexaFi AI Coach · Agent 2.0</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  LIVE TOOLS
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* User question */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm">
                    {EXAMPLE_EXCHANGE.question}
                  </div>
                </div>

                {/* Tool badge */}
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/8 px-2.5 py-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                    <Wallet className="size-2.5" />
                    {EXAMPLE_EXCHANGE.toolUsed}
                  </span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>

                {/* AI answer */}
                <div className="flex items-start gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                    <Bot className="size-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 rounded-2xl rounded-tl-sm border border-border/60 bg-background/60 px-4 py-3 text-xs leading-relaxed text-foreground/85 backdrop-blur-sm">
                    {EXAMPLE_EXCHANGE.answer.split('\n').map((line, i) => {
                      const withBold = line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                        j % 2 === 1 ? <strong key={j} className="font-semibold text-foreground">{part}</strong> : part
                      )
                      return line.trim() === '' ? <br key={i} /> : <p key={i} className="mb-1">{withBold}</p>
                    })}
                  </div>
                </div>

                {/* CTA nudge */}
                <div className="flex items-center justify-end">
                  <button className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                    Try with your real data
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
