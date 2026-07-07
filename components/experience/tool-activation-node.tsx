'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface ToolActivationNodeProps {
  label: string
  icon: LucideIcon
  isActive: boolean
  isCompleted: boolean
  isReducedMotion: boolean
  xOffset: number
  yOffset: number
}

export function ToolActivationNode({
  label,
  icon: Icon,
  isActive,
  isCompleted,
  isReducedMotion,
  xOffset,
  yOffset,
}: ToolActivationNodeProps) {
  return (
    <motion.div
      initial={isReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, x: xOffset * 0.5, y: yOffset * 0.5 }}
      animate={
        isActive || isCompleted
          ? { opacity: 1, scale: 1, x: xOffset, y: yOffset }
          : { opacity: 0, scale: 0.8, x: xOffset * 0.5, y: yOffset * 0.5 }
      }
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      className="absolute flex flex-col items-center gap-1.5 z-20 pointer-events-none"
    >
      {/* Node circle */}
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xl border bg-card/90 shadow-lg backdrop-blur-md transition-all duration-300",
          isCompleted
            ? "border-primary text-primary bg-primary/5"
            : "border-border text-muted-foreground"
        )}
      >
        <Icon className={cn("size-5 transition-transform duration-300", isCompleted && "scale-110")} />
      </div>

      {/* Label text */}
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 whitespace-nowrap bg-background/80 px-2 py-0.5 rounded-full border border-border/40 backdrop-blur-sm shadow-sm",
        isCompleted ? "text-primary border-primary/20" : "text-muted-foreground/60"
      )}>
        {label}
      </span>
    </motion.div>
  )
}
