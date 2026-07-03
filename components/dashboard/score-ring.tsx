'use client'

import { cn } from '@/lib/utils'

export function ScoreRing({
  score,
  size = 160,
  stroke = 12,
  label = 'Health Score',
}: {
  score: number
  size?: number
  stroke?: number
  label?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const tone =
    score >= 80 ? 'Strong' : score >= 60 ? 'Healthy' : score >= 40 ? 'Fair' : 'Needs work'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('text-3xl font-semibold tabnum tracking-tight')}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
        <span className="mt-1 text-xs font-medium text-primary">{tone}</span>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}
