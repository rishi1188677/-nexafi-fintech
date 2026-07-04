'use client'

import * as React from 'react'
import { PlusCircle, Loader2 } from 'lucide-react'
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
import { formatINR } from '@/lib/format'

interface AddContributionDialogProps {
  userId: string
  goalId: string
  onSuccess: () => void
}

export function AddContributionDialog({ userId, goalId, onSuccess }: AddContributionDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [amount, setAmount] = React.useState('')
  const [remainingTarget, setRemainingTarget] = React.useState<number | null>(null)

  // Fetch the latest remaining balance when dialog opens
  const fetchLatestGoal = React.useCallback(async () => {
    setError(null)
    const supabase = createClient()
    try {
      const { data, error: fetchErr } = await supabase
        .from('goals')
        .select('current_amount, target_amount')
        .eq('id', goalId)
        .single()

      if (fetchErr) throw fetchErr

      if (data) {
        setRemainingTarget(data.target_amount - data.current_amount)
      }
    } catch (err: any) {
      setError('Could not retrieve latest goal status.')
    }
  }, [goalId])

  React.useEffect(() => {
    if (open) {
      fetchLatestGoal()
      setAmount('')
    }
  }, [open, fetchLatestGoal])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Contribution amount must be a positive number.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // 1. Fetch latest goal values inside submission flow to prevent stale checks
      const { data: latestGoal, error: fetchErr } = await supabase
        .from('goals')
        .select('current_amount, target_amount')
        .eq('id', goalId)
        .single()

      if (fetchErr) throw fetchErr

      if (!latestGoal) {
        throw new Error('Goal not found.')
      }

      const remaining = latestGoal.target_amount - latestGoal.current_amount

      // 2. Validate limit
      if (numAmount > remaining) {
        setError(`Contribution exceeds remaining target. Max allowed: ${formatINR(remaining)}`)
        setLoading(false)
        return
      }

      // 3. Insert goal contribution
      const { error: insertErr } = await supabase.from('goal_contributions').insert({
        user_id: userId,
        goal_id: goalId,
        amount: numAmount,
      })

      if (insertErr) throw insertErr

      // 4. Update goal current_amount safely, capped exactly at target_amount
      const nextAmount = Math.min(latestGoal.target_amount, latestGoal.current_amount + numAmount)
      const { error: updateErr } = await supabase
        .from('goals')
        .update({ current_amount: nextAmount })
        .eq('id', goalId)

      if (updateErr) throw updateErr

      setOpen(false)
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while saving.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="border-border/60 hover:bg-muted/40 h-8 font-medium">
            <PlusCircle className="size-3.5 mr-1" />
            Contribute
          </Button>
        }
      />
      <DialogContent className="border border-border/80 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md max-w-sm w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">Add Contribution</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Record a contribution towards this savings goal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          {/* Amount */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="contribAmount" className="text-xs font-medium text-muted-foreground">Contribution Amount (₹)</Label>
              {remainingTarget !== null && (
                <span className="text-[10px] font-medium text-primary">
                  Remaining limit: {formatINR(remainingTarget)}
                </span>
              )}
            </div>
            <Input
              id="contribAmount"
              type="number"
              inputMode="decimal"
              min="1"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
              required
              disabled={loading}
              autoFocus
            />
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
                  Saving...
                </>
              ) : (
                'Add Funds'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
