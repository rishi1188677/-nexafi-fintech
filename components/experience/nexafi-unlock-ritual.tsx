'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { 
  TrendingUp, 
  Wallet, 
  Target, 
  CalendarClock, 
  Sun,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AiCoreOrb } from './ai-core-orb'
import { ToolActivationNode } from './tool-activation-node'
import { cn } from '@/lib/utils'

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'nexafi::ritual::completed'

const TOOLS = [
  { id: 'cashflow', label: 'Cashflow', icon: TrendingUp, x: -160, y: -90 },
  { id: 'budget', label: 'Budgets', icon: Wallet, x: 160, y: -90 },
  { id: 'goals', label: 'Savings Goals', icon: Target, x: -170, y: 70 },
  { id: 'bills', label: 'Bills Tracker', icon: CalendarClock, x: 170, y: 70 },
  { id: 'briefing', label: 'Daily Briefing', icon: Sun, x: 0, y: -160 },
]

export function NexaFiUnlockRitual({ onComplete }: { onComplete: () => void }) {
  const isReducedMotion = !!useReducedMotion()
  const [stage, setStage] = React.useState<'idle' | 'holding' | 'unlocked' | 'connecting' | 'revealing' | 'done'>('idle')
  const [activeNodeIndex, setActiveNodeIndex] = React.useState<number>(-1)
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    // Check if ritual was already completed today
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const { timestamp } = JSON.parse(stored)
      const oneDay = 24 * 60 * 60 * 1000
      if (Date.now() - timestamp < oneDay) {
        onComplete()
        return
      }
    }
    setHasMounted(true)
  }, [onComplete])

  // Sequentially activate tool nodes after core is unlocked
  React.useEffect(() => {
    if (stage !== 'connecting') return

    if (isReducedMotion) {
      // Skip the sequential node activations for accessibility/reduced motion
      setStage('revealing')
      setTimeout(() => {
        handleFinished()
      }, 400)
      return
    }

    let index = 0
    const interval = setInterval(() => {
      if (index < TOOLS.length) {
        setActiveNodeIndex(index)
        index++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setStage('revealing')
          setTimeout(() => {
            handleFinished()
          }, 800)
        }, 600)
      }
    }, 300)

    return () => clearInterval(interval)
  }, [stage, isReducedMotion])

  const handleUnlock = () => {
    setStage('unlocked')
    setTimeout(() => {
      setStage('connecting')
    }, 600)
  }

  const handleFinished = () => {
    // Save completion timestamp to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }))
    setStage('done')
    onComplete()
  }

  const handleSkip = () => {
    handleFinished()
  }

  if (!hasMounted || stage === 'done') return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
      >
        {/* Subtle grid pattern background */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-35" />
        <div className="pointer-events-none absolute inset-0 bg-radial-glow opacity-80" />

        {/* Floating background decorative blobs */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 size-[300px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 size-[300px] rounded-full bg-accent/5 blur-[100px]" />

        <div className="relative flex flex-col items-center justify-center max-w-lg px-4 text-center">
          
          {/* Header Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-12 space-y-2 z-10"
          >
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Lock className="size-3" /> Secure AI Environment
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Unlock Today's Financial Intelligence
            </h2>
            <p className="text-sm text-muted-foreground/80 max-w-sm mx-auto leading-relaxed">
              Complete the secure handshake to initialize your NexaFi AI Command Center modules.
            </p>
          </motion.div>

          {/* Interactive Core & Node Diagram Area */}
          <div className="relative flex size-[360px] items-center justify-center mb-10">
            {/* SVG Connecting Lines */}
            {!isReducedMotion && (
              <svg className="absolute inset-0 size-full pointer-events-none overflow-visible">
                {TOOLS.map((tool, index) => {
                  const nodeActive = index <= activeNodeIndex
                  const drawingFinished = stage === 'revealing' || stage === 'done'
                  
                  return (
                    <g key={tool.id}>
                      {/* Connection path outline */}
                      <path
                        d={`M 180,180 L ${180 + tool.x},${180 + tool.y}`}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="1.5"
                        className="opacity-10"
                      />
                      {/* Glowing active path overlay */}
                      <motion.path
                        d={`M 180,180 L ${180 + tool.x},${180 + tool.y}`}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="1.5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={
                          nodeActive || drawingFinished
                            ? { pathLength: 1, opacity: 0.6 }
                            : { pathLength: 0, opacity: 0 }
                        }
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      />
                    </g>
                  )
                })}
              </svg>
            )}

            {/* Central AI Core Orb */}
            <AiCoreOrb
              onUnlock={handleUnlock}
              isUnlocked={stage !== 'idle' && stage !== 'holding'}
              isReducedMotion={isReducedMotion}
            />

            {/* Floating Tool Activation Nodes */}
            {TOOLS.map((tool, index) => {
              const nodeActive = stage === 'connecting' && index === activeNodeIndex
              const isCompleted = index < activeNodeIndex || stage === 'revealing' || stage === 'done'
              
              return (
                <ToolActivationNode
                  key={tool.id}
                  label={tool.label}
                  icon={tool.icon}
                  isActive={nodeActive}
                  isCompleted={isCompleted}
                  isReducedMotion={isReducedMotion}
                  xOffset={tool.x}
                  yOffset={tool.y}
                />
              )
            })}
          </div>

          {/* Quick Skip Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 z-10"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-xs text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 gap-1.5"
            >
              Skip Intro
              <ArrowRight className="size-3" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
