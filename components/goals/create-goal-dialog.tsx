'use client'

import * as React from 'react'
import { Plus, Loader2 } from 'lucide-react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateGoalDialogProps {
  userId: string
  onSuccess: () => void
}

export function CreateGoalDialog({ userId, onSuccess }: CreateGoalDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form states
  const [title, setTitle] = React.useState('')
  const [targetAmount, setTargetAmount] = React.useState('')
  const [startingAmount, setStartingAmount] = React.useState('0')
  const [monthlyContribution, setMonthlyContribution] = React.useState('')
  const [targetDate, setTargetDate] = React.useState('')

  // Set default values on open
  React.useEffect(() => {
    if (open) {
      setTitle('')
      setTargetAmount('')
      setStartingAmount('0')
      setMonthlyContribution('')
      // Set default date to 1 year from today
      const date = new Date()
      date.setFullYear(date.getFullYear() + 1)
      setTargetDate(date.toISOString().split('T')[0])
      setError(null)
    }
  }, [open])

  function reset() {
    setTitle('')
    setTargetAmount('')
    setStartingAmount('0')
    setMonthlyContribution('')
    setTargetDate('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const target = parseFloat(targetAmount)
    const starting = parseFloat(startingAmount)
    const monthly = parseFloat(monthlyContribution || '0')

    if (!title.trim()) {
      setError('Please provide a goal title.')
      return
    }
    if (isNaN(target) || target <= 0) {
      setError('Target amount must be a positive number.')
      return
    }
    if (isNaN(starting) || starting < 0) {
      setError('Starting amount cannot be negative.')
      return
    }
    if (starting > target) {
      setError('Starting amount cannot exceed target amount.')
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
      const { error: insertError } = await supabase.from('goals').insert({
        user_id: userId,
        title: title.trim(),
        target_amount: target,
        current_amount: starting,
        monthly_contribution: monthly,
        target_date: targetDate,
      })

      if (insertError) {
        throw insertError
      }

      reset()
      setOpen(false)
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while saving.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) reset()
    }}>
      <DialogTrigger
        render={
          <Button size="sm" className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium shadow-lg shadow-primary/10">
            <Plus className="size-4 mr-1.5" />
            Create goal
          </Button>
        }
      />
      <DialogContent className="border border-border/80 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">Create Savings Goal</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Define a title, target amount, target date, and optional monthly contribution.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          {/* Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="goalTitle" className="text-xs font-medium text-muted-foreground">Goal Title</Label>
            <Input
              id="goalTitle"
              placeholder="e.g. Europe Trip, Emergency Fund"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Target Amount */}
            <div className="grid gap-1.5">
              <Label htmlFor="targetAmount" className="text-xs font-medium text-muted-foreground">Target Amount (₹)</Label>
              <Input
                id="targetAmount"
                type="number"
                inputMode="decimal"
                min="1"
                step="any"
                placeholder="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
                required
              />
            </div>

            {/* Starting Amount */}
            <div className="grid gap-1.5">
              <Label htmlFor="startingAmount" className="text-xs font-medium text-muted-foreground">Starting Balance (₹)</Label>
              <Input
                id="startingAmount"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="0"
                value={startingAmount}
                onChange={(e) => setStartingAmount(e.target.value)}
                className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Monthly Contribution */}
            <div className="grid gap-1.5">
              <Label htmlFor="monthlyContribution" className="text-xs font-medium text-muted-foreground">Monthly Contribution (₹)</Label>
              <Input
                id="monthlyContribution"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Optional"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
              />
            </div>

            {/* Target Date */}
            <div className="grid gap-1.5">
              <Label htmlFor="targetDate" className="text-xs font-medium text-muted-foreground">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10 [color-scheme:dark]"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <DialogFooter className="mt-2 flex gap-2">
            <DialogClose render={<Button type="button" variant="outline" className="border-border/60 hover:bg-muted/40 h-10" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 font-medium px-4">
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Goal'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
