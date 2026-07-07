'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  ShoppingCart,
  Wallet,
  TrendingUp,
  BarChart3,
  Target,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

interface ToolBadge {
  label: string
  color: string
  bg: string
  icon: React.ElementType
}

interface DemoQuestion {
  id: string
  question: string
  tools: ToolBadge[]
  summary: string
  observations: string[]
  suggestions: string[]
}

const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: 'swiggy',
    question: 'How much did I spend on Swiggy?',
    tools: [{ label: 'Merchant Spending Tool', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: ShoppingCart }],
    summary: 'You spent **₹3,847** on Swiggy this month across **6 orders** — averaging ₹641 per order.',
    observations: [
      'Swiggy accounts for 13% of your total food & dining budget.',
      'Your last order was on Jul 3rd for ₹742.',
      'This is 22% higher than your 3-month average of ₹3,152.',
    ],
    suggestions: [
      'Setting a ₹3,000 weekly cap on Swiggy could save ₹800/month.',
      'Weekend orders average 2× your weekday spend — consider meal prepping on Sundays.',
    ],
  },
  {
    id: 'trip',
    question: 'Can I afford a ₹1,20,000 trip next year?',
    tools: [
      { label: 'Affordability Tool', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', icon: Wallet },
      { label: 'Goal Tracking Tool', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: Target },
    ],
    summary: 'Your **average monthly surplus** is **₹13,200** after goal contributions. At this rate, you could reach ₹1,20,000 in **9–10 months** — well within next year.',
    observations: [
      'Active goal commitments: ₹5,200/month total.',
      'Your Emergency Fund will complete in 4 months, freeing up ₹3,000.',
      'One subscription (₹1,247/mo) appears unused and could be redirected.',
    ],
    suggestions: [
      'Create a "Trip Fund" goal for ₹1,20,000 starting this month.',
      'Cancelling the unused subscription adds ₹15,000 over 12 months.',
    ],
  },
  {
    id: 'expenses',
    question: 'Why did my expenses increase?',
    tools: [{ label: 'Trend Tool', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: TrendingUp }],
    summary: 'Your expenses are **₹4,230 higher** this month compared to June — a **17% increase**.',
    observations: [
      'Shopping jumped by ₹2,100 (likely Amazon purchases on Jul 1–4).',
      'Dining out increased by ₹1,400, particularly weekend orders.',
      'Utility bills rose by ₹730 — possibly summer AC usage.',
    ],
    suggestions: [
      'Set a shopping alert at 80% of your monthly budget to catch spikes early.',
      'Review the Jul 1–4 transactions — recurring items may have auto-renewed.',
    ],
  },
  {
    id: 'budget',
    question: 'Am I within budget?',
    tools: [{ label: 'Budget Tool', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: BarChart3 }],
    summary: 'You have **3 active budgets**. Two are healthy; **Shopping is at 94%** with 8 days remaining.',
    observations: [
      'Food & Dining: ₹4,830 / ₹6,000 (71%) — on track.',
      'Shopping: ₹5,640 / ₹6,000 (94%) — near limit.',
      'Transport: ₹1,440 / ₹3,000 (48%) — well within budget.',
    ],
    suggestions: [
      'Avoid large purchases in Shopping for the next 8 days.',
      'Remaining safe-to-spend across all budgets: ₹3,090.',
    ],
  },
  {
    id: 'goals',
    question: 'Am I on track for my goals?',
    tools: [{ label: 'Goal Tracking Tool', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: Target }],
    summary: 'You have **2 active goals**. Emergency Fund is progressing well; Travel Fund needs attention.',
    observations: [
      'Emergency Fund: 68% complete (₹68,000 / ₹1,00,000) — on schedule for Nov.',
      'Travel Fund: 42% complete (₹25,200 / ₹60,000) — projected to slip by 6 weeks.',
      'Total monthly goal contributions: ₹5,200.',
    ],
    suggestions: [
      'Adding ₹1,000 more to Travel Fund each month closes the 6-week gap.',
      'Emergency Fund will free ₹3,200/month in November — redirect to Travel.',
    ],
  },
]

function ToolBadgePill({ tool }: { tool: ToolBadge }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold', tool.bg, tool.color)}>
      <tool.icon className="size-2.5" />
      {tool.label}
    </span>
  )
}

function AnswerCard({ demo }: { demo: DemoQuestion }) {
  function renderBold(text: string) {
    return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1
        ? <strong key={i} className="font-semibold text-foreground">{part}</strong>
        : <span key={i}>{part}</span>
    )
  }

  return (
    <motion.div
      key={demo.id}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-border/50 bg-background/50 px-5 py-4 backdrop-blur-sm">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
          <Bot className="size-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">NexaFi AI Coach</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-2.5" /> Verified
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {demo.tools.map((t) => <ToolBadgePill key={t.label} tool={t} />)}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4 text-sm">
        {/* Summary */}
        <p className="leading-relaxed text-foreground/85">{renderBold(demo.summary)}</p>

        {/* Observations */}
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Observations</p>
          <ul className="space-y-1.5">
            {demo.observations.map((obs, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
                {renderBold(obs)}
              </li>
            ))}
          </ul>
        </div>

        {/* Suggestions */}
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Action suggestions</p>
          <ol className="space-y-1.5">
            {demo.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[9px] font-bold text-primary">{i + 1}</span>
                {renderBold(s)}
              </li>
            ))}
          </ol>
        </div>

        {/* Disclaimer */}
        <p className="border-t border-border/30 pt-3 text-[10px] italic text-muted-foreground/60">
          This is a simulated demo using mock data. Sign in to see answers based on your real transactions.
        </p>
      </div>
    </motion.div>
  )
}

export function InteractiveAiDemo() {
  const [selected, setSelected] = useState<string>(DEMO_QUESTIONS[0].id)
  const current = DEMO_QUESTIONS.find((d) => d.id === selected)!

  return (
    <section className="relative border-b border-border/60 bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/4 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">

        {/* Header */}
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3" />
            Try it — no sign-up needed
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            See the AI Agent in action
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Click any question below to see how NexaFi's AI Agent 2.0 would answer it — with real tool calculations, not guesses.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">

          {/* Left: question buttons */}
          <motion.div
            className="flex flex-col gap-2.5"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sample questions</p>
            {DEMO_QUESTIONS.map((demo, i) => (
              <motion.button
                key={demo.id}
                onClick={() => setSelected(demo.id)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-250',
                  selected === demo.id
                    ? 'border-primary/40 bg-primary/8 text-foreground shadow-sm'
                    : 'border-border/50 bg-card/60 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground',
                )}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
              >
                <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors',
                  selected === demo.id ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border/50 bg-muted/50 text-muted-foreground group-hover:border-border group-hover:text-foreground'
                )}>
                  {i + 1}
                </span>
                <span className="flex-1 font-medium leading-snug">{demo.question}</span>
                <ChevronRight className={cn('size-4 shrink-0 transition-all duration-200', selected === demo.id ? 'text-primary translate-x-0.5' : 'text-muted-foreground/40 group-hover:text-muted-foreground')} />
              </motion.button>
            ))}

            {/* Hint */}
            <div className="mt-2 rounded-xl border border-dashed border-border/50 bg-muted/30 px-4 py-3 text-center text-[11px] text-muted-foreground">
              Sign in to ask your own questions with live data →
            </div>
          </motion.div>

          {/* Right: answer card */}
          <div>
            {/* User bubble */}
            <motion.div
              className="mb-3 flex justify-end"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
            >
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20">
                {current.question}
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <AnswerCard key={selected} demo={current} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
