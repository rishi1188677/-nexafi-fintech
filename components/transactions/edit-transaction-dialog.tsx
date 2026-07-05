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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { categoryList } from '@/lib/data'

interface DBTransaction {
  id: string
  user_id: string
  merchant: string
  amount: number
  transaction_type: 'income' | 'expense'
  category: string
  payment_method: string
  transaction_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

interface EditTransactionDialogProps {
  transaction: DBTransaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess: () => void
}

const paymentMethods = ['Card', 'UPI', 'Bank Transfer', 'Cash', 'Other']

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  userId,
  onSuccess,
}: EditTransactionDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form states
  const [merchant, setMerchant] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [type, setType] = React.useState<'expense' | 'income'>('expense')
  const [category, setCategory] = React.useState<string>('food')
  const [paymentMethod, setPaymentMethod] = React.useState<string>('UPI')
  const [date, setDate] = React.useState<string>('')
  const [notes, setNotes] = React.useState('')

  // Pre-fill fields when transaction changes
  React.useEffect(() => {
    if (transaction) {
      setMerchant(transaction.merchant)
      setAmount(String(transaction.amount))
      setType(transaction.transaction_type)
      setCategory(transaction.category)
      setPaymentMethod(transaction.payment_method)
      
      // Handle date format (YYYY-MM-DD)
      const rawDate = transaction.transaction_date
      const formattedDate = rawDate ? rawDate.split('T')[0] : ''
      setDate(formattedDate)
      
      setNotes(transaction.notes || '')
      setError(null)
    }
  }, [transaction, open])

  // Automatically update category if type changes
  React.useEffect(() => {
    if (open) {
      if (type === 'income') {
        setCategory('income')
      } else if (category === 'income') {
        setCategory('food')
      }
    }
  }, [type, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!transaction) return
    setError(null)

    const numAmount = parseFloat(amount)
    if (!merchant.trim()) {
      setError('Merchant name is required.')
      return
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number.')
      return
    }
    if (!date) {
      setError('Transaction date is required.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          merchant: merchant.trim(),
          amount: numAmount,
          transaction_type: type,
          category,
          payment_method: paymentMethod,
          transaction_date: date,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id)
        .eq('user_id', userId) // Critical safeguard check

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
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">Edit Transaction</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Modify details for this transaction. Updates will sync instantly to your NexaFi workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1 rounded-lg border border-border/40">
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              className={`h-9 font-medium text-sm transition-all rounded-md ${
                type === 'expense'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setType('expense')}
            >
              Expense
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              className={`h-9 font-medium text-sm transition-all rounded-md ${
                type === 'income'
                  ? 'bg-primary/15 text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setType('income')}
            >
              Income
            </Button>
          </div>

          {/* Merchant */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-merchant" className="text-xs font-medium text-muted-foreground">Merchant</Label>
            <Input
              id="edit-merchant"
              placeholder="e.g. Swiggy, Netflix, Salary"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div className="grid gap-1.5">
              <Label htmlFor="edit-amount" className="text-xs font-medium text-muted-foreground">Amount (₹)</Label>
              <Input
                id="edit-amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10"
                required
                disabled={loading}
              />
            </div>

            {/* Date */}
            <div className="grid gap-1.5">
              <Label htmlFor="edit-date" className="text-xs font-medium text-muted-foreground">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 h-10 dark:[color-scheme:dark]"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Category</Label>
              <Select
                value={category}
                onValueChange={(v) => { if (v) setCategory(v) }}
                disabled={type === 'income' || loading}
              >
                <SelectTrigger className="bg-muted/20 border-border/50 focus:ring-primary/40 h-10 w-full text-left">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border text-popover-foreground p-1 shadow-xl">
                  {categoryList
                    .filter((c) => (type === 'income' ? c.id === 'income' : c.id !== 'income'))
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => { if (v) setPaymentMethod(v) }}
                disabled={loading}
              >
                <SelectTrigger className="bg-muted/20 border-border/50 focus:ring-primary/40 h-10 w-full text-left">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border text-popover-foreground p-1 shadow-xl">
                  {paymentMethods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-notes" className="text-xs font-medium text-muted-foreground">Notes (Optional)</Label>
            <Textarea
              id="edit-notes"
              placeholder="Add extra details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-muted/20 border-border/50 focus-visible:ring-primary/40 min-h-[70px] resize-none"
              disabled={loading}
            />
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
