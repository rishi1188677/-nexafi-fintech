'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Bot, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

const insights = [
  {
    type: 'trend',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Spending Trend',
    body: 'Your dining expenses are down 18% vs. last month. Great progress on your food budget!',
  },
  {
    type: 'alert',
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Budget Alert',
    body: 'Shopping is at 94% of your monthly budget with 8 days remaining.',
  },
  {
    type: 'ai',
    icon: Bot,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10 border-violet-500/20',
    title: 'AI Coach',
    body: 'Based on your pattern, you could save ₹3,200 more by reducing weekend impulse purchases.',
  },
  {
    type: 'tip',
    icon: Lightbulb,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
    title: 'Smart Tip',
    body: 'Three recurring subscriptions total ₹1,247/month. Consider auditing which ones you actively use.',
  },
]

export function FloatingInsightCard({ className }: { className?: string }) {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % insights.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [])

  const insight = insights[activeIdx]

  return (
    <div className={cn('w-full max-w-sm', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={insight.type}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'rounded-xl border p-4 backdrop-blur-sm shadow-lg',
            insight.bg
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border', insight.bg)}>
              <insight.icon className={cn('size-4', insight.color)} />
            </div>
            <div>
              <p className={cn('text-[11px] font-semibold uppercase tracking-wide', insight.color)}>
                {insight.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                {insight.body}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {insights.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === activeIdx ? 'w-5 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground/40'
            )}
            aria-label={`Insight ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
