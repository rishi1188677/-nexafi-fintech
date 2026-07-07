'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  CheckCircle2,
  Utensils,
  Receipt,
  ShoppingBag,
  Plane,
  Coins,
  TrendingUp,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MoneyFlowStage } from './money-flow-stage'

// ─── Constants ───────────────────────────────────────────────────────────────

const STAGES = [
  { id: 'read', label: 'Reading Statement File' },
  { id: 'columns', label: 'Detecting Mapped Columns' },
  { id: 'clean', label: 'Cleaning Merchant Names' },
  { id: 'categorize', label: 'Running AI Categorization' },
  { id: 'save', label: 'Batch Saving Transactions' },
  { id: 'dashboard', label: 'Rebuilding Workspace Metrics' },
]

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: Utensils, color: 'text-orange-500 border-orange-500/25 bg-orange-500/5', x: 150, y: -100 },
  { id: 'bills', label: 'Bills', icon: Receipt, color: 'text-blue-500 border-blue-500/25 bg-blue-500/5', x: 180, y: -40 },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'text-amber-500 border-amber-500/25 bg-amber-500/5', x: 180, y: 30 },
  { id: 'travel', label: 'Travel', icon: Plane, color: 'text-emerald-500 border-emerald-500/25 bg-emerald-500/5', x: 140, y: 90 },
  { id: 'income', label: 'Income', icon: Coins, color: 'text-violet-500 border-violet-500/25 bg-violet-500/5', x: 80, y: 140 },
]

interface CsvMoneyFlowProps {
  progress: number // real DB insert progress (0 to 100)
  fileName: string
  totalRows: number
}

export function CsvMoneyFlow({ progress, fileName, totalRows }: CsvMoneyFlowProps) {
  const [activeStage, setActiveStage] = React.useState('read')
  const [completedStages, setCompletedStages] = React.useState<string[]>([])
  const [flowCount, setFlowCount] = React.useState(0)

  // Auto-advance early steps (read, columns, clean, categorize) before saving starts
  React.useEffect(() => {
    const sequence = async () => {
      // 1. Reading file
      setActiveStage('read')
      await new Promise(r => setTimeout(r, 600))
      setCompletedStages(prev => [...prev, 'read'])

      // 2. Columns
      setActiveStage('columns')
      await new Promise(r => setTimeout(r, 700))
      setCompletedStages(prev => [...prev, 'columns'])

      // 3. Cleaning
      setActiveStage('clean')
      await new Promise(r => setTimeout(r, 800))
      setCompletedStages(prev => [...prev, 'clean'])

      // 4. Categorizing
      setActiveStage('categorize')
      await new Promise(r => setTimeout(r, 950))
      setCompletedStages(prev => [...prev, 'categorize'])

      // 5. Hand over to active database save step
      setActiveStage('save')
    }

    sequence()
  }, [])

  // Sync stage based on actual DB batch insert progress
  React.useEffect(() => {
    if (completedStages.includes('categorize')) {
      if (progress > 0 && progress < 90) {
        setActiveStage('save')
      } else if (progress >= 90 && progress < 100) {
        if (!completedStages.includes('save')) {
          setCompletedStages(prev => [...prev, 'save'])
        }
        setActiveStage('dashboard')
      } else if (progress === 100) {
        if (!completedStages.includes('save')) {
          setCompletedStages(prev => [...prev, 'save'])
        }
        if (!completedStages.includes('dashboard')) {
          setCompletedStages(prev => [...prev, 'dashboard'])
        }
        setActiveStage('complete')
      }
    }
  }, [progress, completedStages])

  // Periodically generate particle counts for flow animation
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFlowCount(prev => prev + 1)
    }, 450)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center justify-center py-6 w-full max-w-3xl mx-auto">
      
      {/* Visual Pipeline Area */}
      <div className="relative flex size-[320px] items-center justify-center shrink-0">
        
        {/* Connection lines paths */}
        <svg className="absolute inset-0 size-full pointer-events-none overflow-visible">
          {CATEGORIES.map((cat) => (
            <g key={cat.id}>
              {/* Connector line */}
              <path
                d={`M 60,160 Q 110,${160 + cat.y * 0.3} L ${160 + cat.x * 0.8},${160 + cat.y * 0.8}`}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1.5"
                className="opacity-15"
              />

              {/* Streaming particle bubbles */}
              <AnimatePresence>
                {completedStages.includes('clean') && !completedStages.includes('dashboard') && (
                  <motion.circle
                    key={`${cat.id}-${flowCount}`}
                    r="3.5"
                    fill="var(--primary)"
                    className="opacity-70"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{ duration: 1.3, ease: 'easeOut' }}
                    style={{
                      offsetPath: `path('M 60,160 Q 110,${160 + cat.y * 0.3} L ${160 + cat.x * 0.8},${160 + cat.y * 0.8}')`,
                      position: 'absolute'
                    }}
                  />
                )}
              </AnimatePresence>
            </g>
          ))}
        </svg>

        {/* Source: CSV File Node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          className="absolute left-3 z-20 flex flex-col items-center gap-1.5"
        >
          <div className="flex size-[72px] items-center justify-center rounded-2xl border border-primary/20 bg-card shadow-lg backdrop-blur-md">
            <div className="relative">
              <FileText className="size-9 text-primary" />
              <span className="absolute -bottom-1 -right-1 flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-primary" />
              </span>
            </div>
          </div>
          <span className="max-w-[90px] truncate text-[10px] font-semibold text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border/40 backdrop-blur-sm">
            {fileName || 'statement.csv'}
          </span>
        </motion.div>

        {/* Dest: Categories Target Nodes */}
        {CATEGORIES.map((cat, idx) => {
          const isActive = completedStages.includes('categorize')
          
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.8, x: cat.x * 0.5, y: cat.y * 0.5 }}
              animate={
                isActive
                  ? { opacity: 1, scale: 1, x: cat.x, y: cat.y }
                  : { opacity: 0, scale: 0.8, x: cat.x * 0.5, y: cat.y * 0.5 }
              }
              transition={{ type: 'spring', stiffness: 160, damping: 18, delay: idx * 0.08 }}
              className={cn(
                "absolute flex size-12 items-center justify-center rounded-full border shadow-md backdrop-blur-md z-20",
                cat.color
              )}
            >
              <cat.icon className="size-5" />
            </motion.div>
          )
        })}
      </div>

      {/* Progress Stages Checklist */}
      <MoneyFlowStage
        stages={STAGES}
        activeId={activeStage}
        completedIds={completedStages}
      />
    </div>
  )
}
