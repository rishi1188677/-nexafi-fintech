'use client'

import * as React from 'react'
import {
  Target,
  Sparkles,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Calendar,
  IndianRupee,
  MoreHorizontal,
  Edit,
  Trash,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CreateGoalDialog } from './create-goal-dialog'
import { AddContributionDialog } from './add-contribution-dialog'
import { EditGoalDialog } from './edit-goal-dialog'
import { DeleteGoalDialog } from './delete-goal-dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { formatINR, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

interface DBGoal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  monthly_contribution: number
  target_date: string // date YYYY-MM-DD
  created_at: string
  updated_at: string
}

export function GoalsClient({ userId }: { userId: string }) {
  const [goals, setGoals] = React.useState<DBGoal[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Dialog states
  const [editingGoal, setEditingGoal] = React.useState<DBGoal | null>(null)
  const [deletingGoal, setDeletingGoal] = React.useState<DBGoal | null>(null)

  const fetchGoals = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data, error: fetchErr } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('target_date', { ascending: true })

      if (fetchErr) throw fetchErr

      setGoals(data || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch savings goals.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  React.useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // Aggregate stats
  const stats = React.useMemo(() => {
    let totalTarget = 0
    let totalSaved = 0
    let activeGoalsCount = 0
    let completedGoalsCount = 0

    goals.forEach((g) => {
      totalTarget += g.target_amount
      totalSaved += g.current_amount
      if (g.current_amount >= g.target_amount) {
        completedGoalsCount++
      } else {
        activeGoalsCount++
      }
    })

    const overallPercent = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

    return {
      totalTarget,
      totalSaved,
      activeGoalsCount,
      completedGoalsCount,
      overallPercent,
    }
  }, [goals])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Savings Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan, prioritize, and track your long-term and short-term financial targets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateGoalDialog userId={userId} onSuccess={fetchGoals} />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <span className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-medium">Loading savings goals...</p>
        </div>
      ) : goals.length === 0 ? (
        /* Empty State */
        <Card className="border border-border/80 bg-card/90 shadow-xl backdrop-blur-sm p-12 text-center py-20 max-w-md mx-auto">
          <div className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary mx-auto shadow-inner">
            <Target className="size-7 text-primary" />
          </div>
          <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
            No savings goals yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Create a goal to start mapping your savings plan towards the things that matter.
          </p>
          <div className="mt-6">
            <CreateGoalDialog userId={userId} onSuccess={fetchGoals} />
          </div>
        </Card>
      ) : (
        /* Content State */
        <div className="space-y-6">
          {/* Summary Statistics Card */}
          <Card className="border border-border/80 bg-card/90 p-6 shadow-md backdrop-blur-sm relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="grid gap-4 md:grid-cols-4 items-center relative">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Goal Savings</p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  {formatINR(stats.totalSaved)}
                </h2>
                <p className="text-xs text-muted-foreground">
                  saved of {formatINR(stats.totalTarget)} target
                </p>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Overall Target Progress</span>
                  <span>{Math.round(stats.overallPercent)}%</span>
                </div>
                <Progress
                  value={stats.overallPercent}
                  className="h-1 w-full"
                  style={{
                    '--primary': 'var(--primary)',
                  } as React.CSSProperties}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center md:text-right md:pl-6 border-t border-border/40 pt-3 md:border-t-0 md:pt-0">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Active</p>
                  <p className="text-lg font-semibold text-foreground">{stats.activeGoalsCount}</p>
                </div>
                <div className="space-y-0.5 border-l border-border/40 md:border-l-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Completed</p>
                  <p className="text-lg font-semibold text-primary">{stats.completedGoalsCount}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Goals Card Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const remaining = goal.target_amount - goal.current_amount
              const percent = Math.min(100, goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0)
              const isCompleted = percent >= 100

              // Calculate ETA if monthly contribution is present
              let estETA = ''
              if (!isCompleted) {
                if (goal.monthly_contribution > 0) {
                  const monthsNeeded = Math.ceil(remaining / goal.monthly_contribution)
                  const completionDate = new Date()
                  completionDate.setMonth(completionDate.getMonth() + monthsNeeded)
                  estETA = completionDate.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                } else {
                  estETA = 'On track once monthly contribution is added'
                }
              }

              return (
                <Card
                  key={goal.id}
                  className={cn(
                    "relative overflow-hidden border bg-card/95 p-5 shadow-sm transition-all hover:shadow-lg hover:border-border/100",
                    isCompleted
                      ? "border-primary/40 bg-radial-gradient shadow-primary/5"
                      : "border-border/80"
                  )}
                >
                  {/* Visual health state marker */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 w-full h-[3px]",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />

                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground truncate max-w-[55%]">
                      {goal.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                        isCompleted
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border/40"
                      )}>
                        {isCompleted ? 'Completed' : 'Active'}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="hover:bg-muted/40 text-muted-foreground hover:text-foreground rounded-md h-6 w-6"
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent className="w-32 bg-card border border-border/80 text-foreground" align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingGoal(goal)}
                            className="cursor-pointer gap-2"
                          >
                            <Edit className="size-3.5 text-muted-foreground" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/60" />
                          <DropdownMenuItem
                            onClick={() => setDeletingGoal(goal)}
                            className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash className="size-3.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between text-xs font-medium text-muted-foreground mb-1.5">
                      <span className="tabnum text-lg font-bold tracking-tight text-foreground">
                        {formatINR(goal.current_amount)}
                      </span>
                      <span>
                        of {formatINR(goal.target_amount)}
                      </span>
                    </div>

                    <Progress
                      value={percent}
                      className="h-1.5 w-full bg-muted/40"
                      style={{
                        '--primary': isCompleted ? 'var(--primary)' : 'oklch(0.74 0.13 165)',
                      } as React.CSSProperties}
                    />

                    <div className="flex items-center justify-between text-[11px] font-medium mt-1.5 text-muted-foreground">
                      <span>{Math.round(percent)}% Saved</span>
                      {isCompleted ? (
                        <span className="flex items-center gap-0.5 text-primary">
                          <CheckCircle2 className="size-3" /> Target Met
                        </span>
                      ) : (
                        <span>{formatINR(remaining)} remaining</span>
                      )}
                    </div>
                  </div>

                  {/* Goal Details & Target Dates */}
                  <div className="mt-5 pt-4 border-t border-border/50 grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Monthly Save</span>
                      <span className="text-foreground font-medium flex items-center gap-0.5">
                        <TrendingUp className="size-3.5 text-muted-foreground" />
                        {goal.monthly_contribution > 0
                          ? `${formatINR(goal.monthly_contribution)}/mo`
                          : 'Not set'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Target Date</span>
                      <span className="text-foreground font-medium flex items-center gap-0.5">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        {formatDate(goal.target_date)}
                      </span>
                    </div>

                    {!isCompleted && (
                      <div className="col-span-2 space-y-1 mt-1">
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Projected ETA</span>
                        <span className={cn(
                          "font-medium",
                          goal.monthly_contribution > 0 ? "text-foreground" : "text-muted-foreground italic text-[11px]"
                        )}>
                          {estETA}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  {!isCompleted && (
                    <div className="mt-5 pt-3 flex justify-end">
                      <AddContributionDialog
                        userId={userId}
                        goalId={goal.id}
                        onSuccess={fetchGoals}
                      />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Edit & Delete Dialogs */}
      <EditGoalDialog
        goal={editingGoal}
        open={!!editingGoal}
        onOpenChange={(open) => { if (!open) setEditingGoal(null) }}
        userId={userId}
        onSuccess={fetchGoals}
      />
      <DeleteGoalDialog
        goal={deletingGoal}
        open={!!deletingGoal}
        onOpenChange={(open) => { if (!open) setDeletingGoal(null) }}
        userId={userId}
        onSuccess={fetchGoals}
      />
    </div>
  )
}
