'use client'

import * as React from 'react'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AiCoreOrbProps {
  onUnlock: () => void
  isUnlocked: boolean
  isReducedMotion: boolean
}

export function AiCoreOrb({ onUnlock, isUnlocked, isReducedMotion }: AiCoreOrbProps) {
  const [isHolding, setIsHolding] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const progressRef = React.useRef(0)
  const requestRef = React.useRef<number | null>(null)
  
  const controls = useAnimation()
  
  // Track holding state to update progress
  React.useEffect(() => {
    if (isUnlocked) return

    const updateProgress = () => {
      if (isHolding) {
        progressRef.current = Math.min(100, progressRef.current + 2.5) // Takes ~1.6 seconds to fill
      } else {
        progressRef.current = Math.max(0, progressRef.current - 4) // Quickly drains when let go
      }
      
      setProgress(progressRef.current)
      
      if (progressRef.current >= 100) {
        onUnlock()
        setIsHolding(false)
        if (requestRef.current) cancelAnimationFrame(requestRef.current)
        return
      }
      
      requestRef.current = requestAnimationFrame(updateProgress)
    }

    requestRef.current = requestAnimationFrame(updateProgress)

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isHolding, isUnlocked, onUnlock])

  // Simple ring values for SVG radial progress
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Pulse when holding
  React.useEffect(() => {
    if (isHolding && !isUnlocked && !isReducedMotion) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { repeat: Infinity, duration: 1, ease: 'easeInOut' }
      })
    } else if (isUnlocked && !isReducedMotion) {
      controls.start({
        scale: [1, 1.2, 0.9, 1],
        boxShadow: [
          '0 0 20px 0px rgba(124, 58, 237, 0.2)',
          '0 0 50px 20px rgba(124, 58, 237, 0.6)',
          '0 0 0px 0px rgba(124, 58, 237, 0)'
        ],
        transition: { duration: 0.6, ease: 'easeOut' }
      })
    } else {
      controls.start({ scale: 1, boxShadow: '0 0 20px 0px rgba(124, 58, 237, 0.1)' })
    }
  }, [isHolding, isUnlocked, controls, isReducedMotion])

  const handleStart = () => {
    if (isUnlocked) return
    setIsHolding(true)
  }

  const handleEnd = () => {
    setIsHolding(false)
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Outer rotating/pulsing ambient ring */}
      <motion.div
        className={cn(
          "absolute size-[160px] rounded-full border border-dashed border-primary/20",
          !isReducedMotion && "animate-[spin_40s_linear_infinite]"
        )}
      />

      <div className="relative flex size-[140px] items-center justify-center">
        {/* SVG Radial Progress */}
        <svg className="absolute -rotate-90 size-[140px] pointer-events-none">
          {/* Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="3"
            className="opacity-20"
          />
          {/* Progress */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-75 ease-out"
          />
        </svg>

        {/* Glow backdrop behind Orb */}
        <div 
          className={cn(
            "absolute inset-8 rounded-full bg-primary/20 blur-xl transition-all duration-500",
            isHolding ? "scale-125 bg-primary/40" : "scale-100"
          )}
        />

        {/* Tactile Core Button */}
        <motion.button
          animate={controls}
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          className={cn(
            "relative z-10 flex size-24 items-center justify-center rounded-full border border-primary/30 bg-background/80 text-primary backdrop-blur-md transition-all select-none cursor-pointer focus:outline-none",
            isHolding ? "border-primary text-primary" : "hover:border-primary/50"
          )}
          style={{
            boxShadow: '0 0 20px 0px rgba(124, 58, 237, 0.1)',
          }}
        >
          <div className="flex flex-col items-center text-center">
            {isUnlocked ? (
              <Sparkles className="size-8 animate-pulse" />
            ) : (
              <Bot className={cn("size-8 transition-transform duration-300", isHolding && "scale-110")} />
            )}
          </div>
        </motion.button>
      </div>

      {/* Helper text instructions */}
      <div className="mt-4 h-6 text-center select-none">
        <p className="text-xs tracking-wider text-muted-foreground uppercase">
          {isUnlocked ? (
            <span className="text-primary font-semibold flex items-center gap-1">
              Core Activated <Sparkles className="size-3.5 inline" />
            </span>
          ) : isHolding ? (
            <span className="text-primary font-medium animate-pulse">Initializing Neural Link...</span>
          ) : (
            "Hold to activate"
          )}
        </p>
      </div>
    </div>
  )
}
