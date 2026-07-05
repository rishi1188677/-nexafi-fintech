'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatINR } from '@/lib/format'

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

interface EditGoalDialogProps {
  goal: DBGoal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess: () => void
}

export function EditGoalDialog({
  goal,
  open,
  onOpenChange,
  userId,
  onSuccess,
}: EditGoalDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form states
  const [title, setTitle] = React.useState('')
  const [targetAmount, setTargetAmount] = React.useState('')
  const [monthlyContribution, setMonthlyContribution] = React.useState('')
  const [targetDate, setTargetDate] = React.useState('')

  React.useEffect(() => {
    if (goal) {
      setTitle(goal.title)
      setTargetAmount(String(goal.target_amount))
      setMonthlyContribution(String(goal.monthly_contribution))
      setTargetDate(goal.target_date ? goal.target_date.split('T')[0] : '')
      setError(null)
    }
  }, [goal, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!goal) return
    setError(null)

    const target = parseFloat(targetAmount)
    const monthly = parseFloat(monthlyContribution || '0')

    if (!title.trim()) {
      setError('Please provide a goal title.')
      return
    }
    if (isNaN(target) || target <= 0) {
      setError('Target amount must be a positive number.')
      return
    }
    // Safeguard: Do not allow goal target_amount to become less than current_amount.
    if (target < goal.current_amount) {
      setError(`Target amount cannot be less than current saved progress of ${formatINR(goal.current_amount)}.`)
      return
    }
    if (isNaN(monthly) || monthly < 0) {
      setError('Monthly contribution cannot be negative.')
      return
    }
    if (!targetDate) {
      setError('Please select a target date.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from('goals')
        .update({
          title: title.trim(),
          target_amount: target,
          monthly_contribution: monthly,
          target_date: targetDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', goal.id)
        .eq('user_id', userId) // Critical filter safeguard

      if (updateError) {
        throw updateError
      }

      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while saving.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-border/80 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">Edit Savings Goal</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Modify details for this savings goal. Target amount cannot be set lower than current saved progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          {/* Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-goalTitle" className="text-xs font-medium text-muted-foreground">Goal Title</Label>
            <Input
              id="edit-goalTitle"
              placeholder="e.g. Europe Trip, Emergency Fund"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Target Amount */}
            <div className="grid gap-1.5">
              <Label htmlFor="edit-targetAmount" className="text-xs font-medium text-muted-foreground">Target Amount (₹)</Label>
              <Input
                id="edit-targetAmount"
                type="number"
                inputMode="decimal"
                min="1"
                step="any"
                placeholder="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
                required
                disabled={loading}
              />
            </div>

            {/* Current progress (read-only) */}
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Current Progress (₹)</Label>
              <Input
                value={goal ? String(goal.current_amount) : '0'}
                readOnly
                disabled
                className="bg-muted/5 border-border/30 opacity-70 h-10 cursor-not-allowed select-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Monthly Contribution */}
            <div className="grid gap-1.5">
              <Label htmlFor="edit-monthlyContribution" className="text-xs font-medium text-muted-foreground">Monthly Contribution (₹)</Label>
              <Input
                id="edit-monthlyContribution"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Optional"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
                disabled={loading}
              />
            </div>

            {/* Target Date */}
            <div className="grid gap-1.5">
              <Label htmlFor="edit-targetDate" className="text-xs font-medium text-muted-foreground">Target Date</Label>
              <Input
                id="edit-targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10 [color-scheme:dark]"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <DialogFooter className="mt-2 flex gap-2">
            <DialogClose render={<Button type="button" variant="outline" disabled={loading} className="border-border/60 hover:bg-muted/40 h-10" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 font-medium px-4">
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
