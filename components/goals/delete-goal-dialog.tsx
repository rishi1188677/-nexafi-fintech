'use client'

import * as React from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
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

interface DeleteGoalDialogProps {
  goal: DBGoal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess: () => void
}

export function DeleteGoalDialog({
  goal,
  open,
  onOpenChange,
  userId,
  onSuccess,
}: DeleteGoalDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setError(null)
    }
  }, [open])

  async function handleDelete() {
    if (!goal) return
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // 1. Cascade Deletion safeguard: Delete all related contributions for this goal first
      const { error: contribError } = await supabase
        .from('goal_contributions')
        .delete()
        .eq('goal_id', goal.id)
        .eq('user_id', userId) // Safe filter match

      if (contribError) {
        throw contribError
      }

      // 2. Delete the savings goal itself
      const { error: deleteError } = await supabase
        .from('goals')
        .delete()
        .eq('id', goal.id)
        .eq('user_id', userId) // Critical filter safeguard

      if (deleteError) {
        throw deleteError
      }

      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Failed to delete savings goal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-border/80 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md max-w-md w-[95vw]">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive mb-3">
            <AlertTriangle className="size-6" />
          </div>
          <DialogTitle className="text-xl font-semibold tracking-tight text-center text-foreground">
            Delete Savings Goal
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm text-center">
            Are you sure you want to permanently delete this savings goal? All logged contributions for this goal will be removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {goal && (
          <div className="bg-muted/15 border border-border/50 rounded-lg p-4 text-sm space-y-2 mt-2 leading-relaxed">
            <div className="flex justify-between border-b border-border/20 pb-2">
              <span className="text-muted-foreground">Goal Title</span>
              <span className="font-medium text-foreground">{goal.title}</span>
            </div>
            <div className="flex justify-between border-b border-border/20 pb-2">
              <span className="text-muted-foreground">Saved Progress</span>
              <span className="font-semibold text-primary">
                {formatINR(goal.current_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Amount</span>
              <span className="font-medium text-foreground">
                {formatINR(goal.target_amount)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive mt-2">
            {error}
          </div>
        )}

        <DialogFooter className="mt-4 flex gap-2 sm:justify-center">
          <DialogClose render={<Button type="button" variant="outline" disabled={loading} className="border-border/60 hover:bg-muted/40 h-10 w-full sm:w-auto" />}>
            Cancel
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
            className="h-10 font-medium px-4 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Confirm Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
