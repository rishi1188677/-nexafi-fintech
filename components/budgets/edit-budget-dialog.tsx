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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { categoryList } from '@/lib/data'

interface DBBudget {
  id: string
  user_id: string
  category: string
  budget_amount: number
  month: string // date string YYYY-MM-DD
  created_at: string
  updated_at: string
}

interface EditBudgetDialogProps {
  budget: DBBudget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess: () => void
}

export function EditBudgetDialog({
  budget,
  open,
  onOpenChange,
  userId,
  onSuccess,
}: EditBudgetDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form states
  const [category, setCategory] = React.useState<string>('food')
  const [budgetAmount, setBudgetAmount] = React.useState('')
  const [month, setMonth] = React.useState('')

  React.useEffect(() => {
    if (budget) {
      setCategory(budget.category)
      setBudgetAmount(String(budget.budget_amount))
      // slice 'YYYY-MM-DD' to 'YYYY-MM' for input
      setMonth(budget.month.slice(0, 7))
      setError(null)
    }
  }, [budget, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!budget) return
    setError(null)

    const amount = parseFloat(budgetAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Budget amount must be a positive number.')
      return
    }
    if (!month) {
      setError('Please select a month.')
      return
    }

    const monthDateString = `${month}-01`

    setLoading(true)
    const supabase = createClient()

    try {
      // 1. Prevent duplicates: Check if another budget exists for this user, category, and month (excluding current budget ID)
      const { data: existing, error: checkError } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('month', monthDateString)
        .neq('id', budget.id) // Critical duplicate check safeguard
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      if (existing) {
        setError('A budget for this category already exists in the selected month.')
        setLoading(false)
        return
      }

      // 2. Update database budget row
      const { error: updateError } = await supabase
        .from('budgets')
        .update({
          category,
          budget_amount: amount,
          month: monthDateString,
          updated_at: new Date().toISOString()
        })
        .eq('id', budget.id)
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
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">Edit Budget</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Modify the spending limit for this budget category.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          {/* Category */}
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={(v) => { if (v) setCategory(v) }} disabled={loading}>
              <SelectTrigger className="bg-muted/20 border-border/50 focus:ring-primary/40 h-10 w-full text-left">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/80 text-foreground">
                {categoryList
                  .filter((c) => c.id !== 'income')
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div className="grid gap-1.5">
              <Label htmlFor="edit-budgetAmount" className="text-xs font-medium text-muted-foreground">Budget Limit (₹)</Label>
              <Input
                id="edit-budgetAmount"
                type="number"
                inputMode="decimal"
                min="1"
                step="any"
                placeholder="e.g. 5000"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
                required
                disabled={loading}
              />
            </div>

            {/* Month Selector */}
            <div className="grid gap-1.5">
              <Label htmlFor="edit-month" className="text-xs font-medium text-muted-foreground">Target Month</Label>
              <Input
                id="edit-month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
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
