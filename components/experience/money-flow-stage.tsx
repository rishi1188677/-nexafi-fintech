'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stage {
  id: string
  label: string
}

interface MoneyFlowStageProps {
  stages: Stage[]
  activeId: string
  completedIds: string[]
}

export function MoneyFlowStage({ stages, activeId, completedIds }: MoneyFlowStageProps) {
  return (
    <div className="flex flex-col gap-4 max-w-sm w-full bg-card/60 border border-border/60 rounded-xl p-5 backdrop-blur-sm shadow-md">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
        Pipeline Processing
      </h4>
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const isActive = stage.id === activeId
          const isCompleted = completedIds.includes(stage.id)
          
          return (
            <div
              key={stage.id}
              className="flex items-center gap-3 text-xs leading-none transition-all duration-300"
            >
              {/* Status indicator icon */}
              <div
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isActive
                      ? 'border-primary text-primary bg-primary/5 animate-pulse'
                      : 'border-border text-muted-foreground/30'
                )}
              >
                {isCompleted ? (
                  <Check className="size-3 stroke-[3]" />
                ) : isActive ? (
                  <Loader2 className="size-2.5 animate-spin" />
                ) : (
                  <span className="text-[9px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Stage label text */}
              <span
                className={cn(
                  'font-medium transition-all duration-300',
                  isCompleted
                    ? 'text-foreground/90'
                    : isActive
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground/50'
                )}
              >
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
