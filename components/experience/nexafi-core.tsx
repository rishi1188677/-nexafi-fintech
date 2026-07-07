'use client'

import * as React from 'react'
import { motion, useAnimation } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Bot, Sparkles } from 'lucide-react'

interface NexaFiCoreProps {
  progress: number
  isHolding: boolean
  isUnlocked: boolean
  isReducedMotion: boolean
  onUnlock: () => void
}

export function NexaFiCore({
  progress,
  isHolding,
  isUnlocked,
  isReducedMotion,
  onUnlock,
}: NexaFiCoreProps) {
  const controls = useAnimation()

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  React.useEffect(() => {
    if (isHolding && !isUnlocked && !isReducedMotion) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
      })
    } else if (isUnlocked && !isReducedMotion) {
      controls.start({
        scale: [1, 1.25, 0.92, 1],
        boxShadow: [
          '0 0 25px 0px rgba(124, 58, 237, 0.2)',
          '0 0 60px 25px rgba(124, 58, 237, 0.7)',
          '0 0 0px 0px rgba(124, 58, 237, 0)',
        ],
        transition: { duration: 0.65, ease: 'easeOut' },
      })
    } else {
      controls.start({
        scale: 1,
        boxShadow: '0 0 25px 0px rgba(124, 58, 237, 0.12)',
      })
    }
  }, [isHolding, isUnlocked, controls, isReducedMotion])

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Dynamic ambient halo ring */}
      <motion.div
        className={cn(
          'absolute size-[170px] rounded-full border border-dashed border-primary/20 bg-primary/2 opacity-30',
          !isReducedMotion && 'animate-[spin_45s_linear_infinite]'
        )}
      />

      <div className="relative flex size-[150px] items-center justify-center">
        {/* Radial progress ring */}
        <svg className="absolute -rotate-90 size-[150px] pointer-events-none">
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="3.5"
            className="opacity-15"
          />
          <motion.circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-75 ease-out"
          />
        </svg>

        {/* Ambient glow backing */}
        <div
          className={cn(
            'absolute inset-8 rounded-full bg-primary/25 blur-2xl transition-all duration-500',
            isHolding ? 'scale-130 bg-primary/45' : 'scale-100'
          )}
        />

        {/* Glowing glass core button */}
        <motion.div
          animate={controls}
          className={cn(
            'relative z-10 flex size-26 items-center justify-center rounded-full border bg-background/85 text-primary backdrop-blur-md select-none transition-all duration-300',
            isHolding ? 'border-primary text-primary' : 'border-primary/30'
          )}
          style={{
            boxShadow: '0 0 25px 0px rgba(124, 58, 237, 0.12)',
          }}
        >
          {isUnlocked ? (
            <Sparkles className="size-9 animate-pulse" />
          ) : (
            <Bot className={cn('size-9 transition-transform duration-300', isHolding && 'scale-110')} />
          )}
        </motion.div>
      </div>

      {/* Guide subtitle */}
      <div className="mt-5 h-6 text-center select-none">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {isUnlocked ? (
            <span className="text-primary font-bold flex items-center justify-center gap-1">
              Core Ready <Sparkles className="size-3.5" />
            </span>
          ) : isHolding ? (
            <span className="text-primary font-semibold animate-pulse">Analyzing Signature...</span>
          ) : (
            'Hold to authenticate'
          )}
        </p>
      </div>
    </div>
  )
}
