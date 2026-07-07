'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface ActivationNodeProps {
  label: string
  icon: LucideIcon
  isCompleted: boolean
  isReducedMotion: boolean
  xOffset: number
  yOffset: number
}

export function ActivationNode({
  label,
  icon: Icon,
  isCompleted,
  isReducedMotion,
  xOffset,
  yOffset,
}: ActivationNodeProps) {
  return (
    <motion.div
      initial={isReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, x: xOffset * 0.4, y: yOffset * 0.4 }}
      animate={
        isCompleted
          ? { opacity: 1, scale: 1, x: xOffset, y: yOffset }
          : { opacity: 0, scale: 0.8, x: xOffset * 0.4, y: yOffset * 0.4 }
      }
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className="absolute flex flex-col items-center gap-1.5 z-20 pointer-events-none"
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-xl border bg-card/90 shadow-xl backdrop-blur-md transition-all duration-300",
          isCompleted ? "border-primary text-primary bg-primary/8" : "border-border text-muted-foreground"
        )}
      >
        <Icon className="size-5.5" />
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 whitespace-nowrap bg-background/80 px-2 py-0.5 rounded-full border border-border/40 backdrop-blur-sm",
        isCompleted ? "text-primary border-primary/20" : "text-muted-foreground/60"
      )}>
        {label}
      </span>
    </motion.div>
  )
}
