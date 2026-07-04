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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { categoryList } from '@/lib/data'

interface CreateBudgetDialogProps {
  userId: string
  onSuccess: () => void
  defaultMonth?: string // YYYY-MM
}

export function CreateBudgetDialog({ userId, onSuccess, defaultMonth }: CreateBudgetDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form states
  const [category, setCategory] = React.useState<string>('food')
  const [budgetAmount, setBudgetAmount] = React.useState('')
  const [month, setMonth] = React.useState('')

  // Set default month on open
  React.useEffect(() => {
    if (open) {
      if (defaultMonth) {
        setMonth(defaultMonth)
      } else {
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        setMonth(`${yyyy}-${mm}`)
      }
      setError(null)
    }
  }, [open, defaultMonth])

  function reset() {
    setCategory('food')
    setBudgetAmount('')
    setMonth('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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

    // Convert 'YYYY-MM' to 'YYYY-MM-01'
    const monthDateString = `${month}-01`

    setLoading(true)
    const supabase = createClient()

    try {
      // 1. Prevent duplicates: Check if a budget already exists for this user, category, and month
      const { data: existing, error: checkError } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('month', monthDateString)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      if (existing) {
        setError('A budget for this category already exists in the selected month.')
        setLoading(false)
        return
      }

      // 2. Insert if no duplicate exists
      const { error: insertError } = await supabase.from('budgets').insert({
        user_id: userId,
        category,
        budget_amount: amount,
        month: monthDateString,
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
            Create budget
          </Button>
        }
      />
      <DialogContent className="border border-border/80 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">Create Budget</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Set a monthly spending limit for a category. Duplicates within the same month are prevented.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          {/* Category */}
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={(v) => { if (v) setCategory(v) }}>
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
              <Label htmlFor="budgetAmount" className="text-xs font-medium text-muted-foreground">Budget Limit (₹)</Label>
              <Input
                id="budgetAmount"
                type="number"
                inputMode="decimal"
                min="1"
                step="any"
                placeholder="e.g. 5000"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
                required
              />
            </div>

            {/* Month Selector */}
            <div className="grid gap-1.5">
              <Label htmlFor="month" className="text-xs font-medium text-muted-foreground">Target Month</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
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
                'Create Budget'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
