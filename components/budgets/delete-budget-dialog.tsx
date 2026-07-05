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
import { categories, type CategoryId } from '@/lib/data'
import { formatINR } from '@/lib/format'

interface DBBudget {
  id: string
  user_id: string
  category: string
  budget_amount: number
  month: string // date string YYYY-MM-DD
  created_at: string
  updated_at: string
}

interface DeleteBudgetDialogProps {
  budget: DBBudget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess: () => void
}

export function DeleteBudgetDialog({
  budget,
  open,
  onOpenChange,
  userId,
  onSuccess,
}: DeleteBudgetDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setError(null)
    }
  }, [open])

  async function handleDelete() {
    if (!budget) return
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budget.id)
        .eq('user_id', userId) // Critical filter safeguard

      if (deleteError) {
        throw deleteError
      }

      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Failed to delete budget limit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const catId = budget?.category as CategoryId
  const catLabel = budget ? (categories[catId]?.label || budget.category) : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-border/80 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md max-w-md w-[95vw]">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive mb-3">
            <AlertTriangle className="size-6" />
          </div>
          <DialogTitle className="text-xl font-semibold tracking-tight text-center text-foreground">
            Delete Budget
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm text-center">
            Are you sure you want to permanently delete this category budget limit? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {budget && (
          <div className="bg-muted/15 border border-border/50 rounded-lg p-4 text-sm space-y-2 mt-2 leading-relaxed">
            <div className="flex justify-between border-b border-border/20 pb-2">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium text-foreground">{catLabel}</span>
            </div>
            <div className="flex justify-between border-b border-border/20 pb-2">
              <span className="text-muted-foreground">Month</span>
              <span className="font-medium text-foreground">{budget.month.slice(0, 7)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget Limit</span>
              <span className="font-semibold text-primary">
                {formatINR(budget.budget_amount)}
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
