'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TrendingUp, Wallet, Target, Bot, Lock, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NexaFiCore } from './nexafi-core'
import { ActivationNode } from './activation-node'
import { Particles } from './particles'

const STORAGE_KEY = 'nexafi::onboarding::unlocked'

const ONBOARDING_NODES = [
  { id: 'cashflow', label: 'Cashflow Ready', icon: TrendingUp, x: -160, y: -70 },
  { id: 'budgets', label: 'Budgets Ready', icon: Wallet, x: 160, y: -70 },
  { id: 'goals', label: 'Goals Ready', icon: Target, x: -160, y: 70 },
  { id: 'ai', label: 'AI Ready', icon: Bot, x: 160, y: 70 },
]

interface UnlockExperienceProps {
  children: React.ReactNode
}

export function UnlockExperience({ children }: { children: React.ReactNode }) {
  const isReducedMotion = !!useReducedMotion()
  const [isUnlocked, setIsUnlocked] = React.useState(false)
  const [hasMounted, setHasMounted] = React.useState(false)
  const [isHolding, setIsHolding] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const progressRef = React.useRef(0)
  const frameRef = React.useRef<number | null>(null)
  
  const [stage, setStage] = React.useState<'idle' | 'holding' | 'unlocked' | 'activating' | 'complete'>('idle')
  const [nodeIndex, setNodeIndex] = React.useState(-1)

  React.useEffect(() => {
    // Check if user has already completed the ritual onboarding
    const completed = localStorage.getItem(STORAGE_KEY)
    if (completed === 'true') {
      setIsUnlocked(true)
    }
    setHasMounted(true)
  }, [])

  // Holding loop
  React.useEffect(() => {
    if (stage === 'unlocked' || stage === 'activating' || stage === 'complete') return

    const tick = () => {
      if (isHolding) {
        progressRef.current = Math.min(100, progressRef.current + 3.5) // ~1.1 seconds hold
      } else {
        progressRef.current = Math.max(0, progressRef.current - 5) // fast drain
      }
      
      setProgress(progressRef.current)

      if (progressRef.current >= 100) {
        handleUnlock()
        return
      }
      
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [isHolding, stage])

  const handleUnlock = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    setIsHolding(false)
    setStage('unlocked')

    if (isReducedMotion) {
      setStage('complete')
      setIsUnlocked(true)
      localStorage.setItem(STORAGE_KEY, 'true')
      return
    }

    // Fast sequential nodes activation (< 1 second total)
    setTimeout(() => {
      setStage('activating')
      let idx = 0
      const timer = setInterval(() => {
        if (idx < ONBOARDING_NODES.length) {
          setNodeIndex(idx)
          idx++
        } else {
          clearInterval(timer)
          setTimeout(() => {
            setStage('complete')
            setTimeout(() => {
              setIsUnlocked(true)
              localStorage.setItem(STORAGE_KEY, 'true')
            }, 400)
          }, 350)
        }
      }, 180)
    }, 300)
  }

  const handleSkip = () => {
    setIsUnlocked(true)
    setStage('complete')
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  const handleStart = () => {
    if (stage === 'unlocked' || stage === 'activating' || stage === 'complete') return
    setIsHolding(true)
    setStage('holding')
  }

  const handleEnd = () => {
    setIsHolding(false)
    if (stage === 'holding') {
      setStage('idle')
    }
  }

  if (!hasMounted) return null

  if (isUnlocked) {
    return <>{children}</>
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
    >
      {/* Background patterns */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 transition-opacity duration-500" />
      <div 
        className="pointer-events-none absolute inset-0 bg-radial-glow transition-opacity duration-500" 
        style={{ opacity: isHolding ? 0.9 : 0.6 }}
      />
      
      {/* Visual floating particles when holding */}
      <Particles count={isHolding ? 35 : 12} color="bg-primary" />

      <div className="relative flex flex-col items-center max-w-md px-6 text-center select-none pointer-events-none">
        
        {/* Header message */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14 space-y-2 z-10"
        >
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-primary">
              <Lock className="size-3" /> Secure System Init
            </span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Unlock your financial workspace.
          </h2>
          <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-xs mx-auto">
            {stage === 'activating' 
              ? 'Synchronizing financial security modules...' 
              : 'Press and hold the AI Core in the center to establish neural session handshake.'}
          </p>
        </motion.div>

        {/* Visual Orb & Node Diagram Area */}
        <div className="relative flex size-[340px] items-center justify-center mb-12">
          {/* Connector lines SVGs */}
          {!isReducedMotion && (
            <svg className="absolute inset-0 size-full overflow-visible">
              {ONBOARDING_NODES.map((n, i) => {
                const nodeActive = i <= nodeIndex
                const showConnector = stage === 'activating' || stage === 'complete'
                return (
                  <g key={n.id}>
                    <path
                      d={`M 170,170 L ${170 + n.x},${170 + n.y}`}
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="1.5"
                      className="opacity-10"
                    />
                    <motion.path
                      d={`M 170,170 L ${170 + n.x},${170 + n.y}`}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="1.5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={
                        nodeActive
                          ? { pathLength: 1, opacity: 0.6 }
                          : { pathLength: 0, opacity: 0 }
                      }
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                  </g>
                )
              })}
            </svg>
          )}

          {/* Interactive Core */}
          <NexaFiCore
            progress={progress}
            isHolding={isHolding}
            isUnlocked={stage !== 'idle' && stage !== 'holding'}
            isReducedMotion={isReducedMotion}
            onUnlock={handleUnlock}
          />

          {/* Feature Nodes */}
          {ONBOARDING_NODES.map((n, i) => {
            const isCompleted = i <= nodeIndex || stage === 'complete'
            return (
              <ActivationNode
                key={n.id}
                label={n.label}
                icon={n.icon}
                isCompleted={isCompleted}
                isReducedMotion={isReducedMotion}
                xOffset={n.x}
                yOffset={n.y}
              />
            )
          })}
        </div>

        {/* Skip controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 z-10 pointer-events-auto"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-xs text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 gap-1.5"
          >
            Skip Activation
            <ArrowRight className="size-3" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
