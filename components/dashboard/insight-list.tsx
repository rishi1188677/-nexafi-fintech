'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles, TrendingUp, TriangleAlert, Info } from 'lucide-react'
import { type Insight } from '@/lib/data'
import { cn } from '@/lib/utils'
import { staggerContainerTight, staggerItem } from '@/lib/motion'

const toneMap: Record<Insight['tone'], { icon: typeof Info; className: string }> = {
  positive: { icon: TrendingUp, className: 'text-primary bg-primary/12' },
  warning: { icon: TriangleAlert, className: 'text-destructive bg-destructive/12' },
  neutral: { icon: Info, className: 'text-accent bg-accent/12' },
}

export function InsightList({ insights, limit }: { insights: Insight[]; limit?: number }) {
  const shouldReduce = useReducedMotion()
  const items = limit ? insights.slice(0, limit) : insights

  return (
    <motion.div
      className="flex flex-col gap-3"
      variants={shouldReduce ? undefined : staggerContainerTight}
      initial={shouldReduce ? undefined : 'hidden'}
      whileInView={shouldReduce ? undefined : 'visible'}
      viewport={{ once: true, margin: '-40px' }}
    >
      {items.map((insight) => {
        const { icon: Icon, className } = toneMap[insight.tone]
        return (
          <motion.div
            key={insight.id}
            variants={shouldReduce ? undefined : staggerItem}
            className="flex gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
          >
            <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-md', className)}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{insight.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground text-pretty">
                {insight.body}
              </p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export function InsightHeader() {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="size-4 text-primary" />
      <span className="text-sm font-medium">AI Insights</span>
    </div>
  )
}
