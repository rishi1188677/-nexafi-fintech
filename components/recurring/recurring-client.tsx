'use client'

import * as React from 'react'
import {
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Receipt,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Clock,
  Loader2,
  HelpCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { categoryList, type CategoryId, categories } from '@/lib/data'
const paymentMethods = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other']
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  detectRecurringPatterns,
  getUpcomingPayments,
  type RecurringItem,
  type UpcomingPayment
} from '@/lib/recurring-helper'

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
}

export function RecurringClient({ userId }: { userId: string }) {
  const [transactions, setTransactions] = React.useState<DBTransaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<'upcoming' | 'patterns'>('upcoming')

  // Local Preferences States (Saved to localStorage)
  const [confirmedIds, setConfirmedIds] = React.useState<string[]>([])
  const [ignoredIds, setIgnoredIds] = React.useState<string[]>([])
  const [notRecurringIds, setNotRecurringIds] = React.useState<string[]>([])
  const [manualItems, setManualItems] = React.useState<RecurringItem[]>([])

  // Modal manual creation states
  const [manualOpen, setManualOpen] = React.useState(false)
  const [manMerchant, setManMerchant] = React.useState('')
  const [manAmount, setManAmount] = React.useState('')
  const [manType, setManType] = React.useState<'income' | 'expense'>('expense')
  const [manCategory, setManCategory] = React.useState('')
  const [manPayment, setManPayment] = React.useState('Card')
  const [manFrequency, setManFrequency] = React.useState<'weekly' | 'monthly'>('monthly')
  const [manStartDate, setManStartDate] = React.useState('')
  const [manNotes, setManNotes] = React.useState('')
  const [manError, setManError] = React.useState<string | null>(null)

  // Load transaction list from Supabase
  React.useEffect(() => {
    async function fetchTransactions() {
      setLoading(true)
      const supabase = createClient()
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)

        if (error) throw error
        setTransactions(data || [])
      } catch (err) {
        console.error('Failed to load transactions for recurring detection:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [userId])

  // Load and sync localStorage configurations
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = `nexafi::recurring::${userId}`
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          setConfirmedIds(parsed.confirmedIds || [])
          setIgnoredIds(parsed.ignoredIds || [])
          setNotRecurringIds(parsed.notRecurringIds || [])
          setManualItems(parsed.manualItems || [])
        }
      } catch (err) {
        console.error('Failed to load recurring preferences from localStorage:', err)
      }
    }
  }, [userId])

  // Sync preferences state changes back to localStorage
  const savePreferences = (
    cIds: string[],
    iIds: string[],
    nrIds: string[],
    mItems: RecurringItem[]
  ) => {
    if (typeof window !== 'undefined') {
      const storageKey = `nexafi::recurring::${userId}`
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            confirmedIds: cIds,
            ignoredIds: iIds,
            notRecurringIds: nrIds,
            manualItems: mItems
          })
        )
      } catch (err) {
        console.error('Failed to persist recurring preferences to localStorage:', err)
      }
    }
  }

  // Action handlers
  const handleConfirmPattern = (id: string) => {
    const updated = [...confirmedIds, id]
    setConfirmedIds(updated)
    savePreferences(updated, ignoredIds, notRecurringIds, manualItems)
  }

  const handleIgnorePattern = (id: string) => {
    const updated = [...ignoredIds, id]
    setIgnoredIds(updated)
    savePreferences(confirmedIds, updated, notRecurringIds, manualItems)
  }

  const handleNotRecurringPattern = (id: string) => {
    const updated = [...notRecurringIds, id]
    setNotRecurringIds(updated)
    savePreferences(confirmedIds, ignoredIds, updated, manualItems)
  }

  const handleDeleteManual = (id: string) => {
    const updated = manualItems.filter(item => item.id !== id)
    setManualItems(updated)
    savePreferences(confirmedIds, ignoredIds, notRecurringIds, updated)
  }

  // Handle manual recurring submit
  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault()
    setManError(null)

    if (!manMerchant.trim()) return setManError('Merchant name is required.')
    if (!manAmount.trim() || isNaN(Number(manAmount)) || Number(manAmount) <= 0) {
      return setManError('Please enter a valid amount greater than 0.')
    }
    if (!manCategory) return setManError('Please select a category.')
    if (!manStartDate) return setManError('Please pick a start or last occurrence date.')

    const newItem: RecurringItem = {
      id: `manual::${Date.now()}`,
      merchant: manMerchant.trim(),
      amount: Math.round(Number(manAmount)),
      transaction_type: manType,
      category: manCategory,
      frequency: manFrequency,
      last_occurrence: manStartDate,
      estimated_next: manStartDate, // Helper will advance this properly
      confidence: 100,
      source: 'manual',
      status: 'active',
      payment_method: manPayment,
      notes: manNotes.trim() || undefined,
      explanation: 'Manually scheduled recurring payment.'
    }

    const updated = [...manualItems, newItem]
    setManualItems(updated)
    savePreferences(confirmedIds, ignoredIds, notRecurringIds, updated)

    // Reset Form
    setManMerchant('')
    setManAmount('')
    setManType('expense')
    setManCategory('')
    setManPayment('Card')
    setManFrequency('monthly')
    setManStartDate('')
    setManNotes('')
    setManualOpen(false)
  }

  // Compute stats and items lists
  const recurringItems = React.useMemo(() => {
    return detectRecurringPatterns(transactions, {
      confirmedIds,
      ignoredIds,
      notRecurringIds,
      manualItems
    })
  }, [transactions, confirmedIds, ignoredIds, notRecurringIds, manualItems])

  const upcomingPayments = React.useMemo(() => {
    return getUpcomingPayments(recurringItems, 30)
  }, [recurringItems])

  // Count remaining days to helper function
  const getDaysDiffStr = (dueDateStr: string) => {
    const today = new Date().setHours(0, 0, 0, 0)
    const dueTime = new Date(dueDateStr).getTime()
    const diffMs = dueTime - today
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    return `Due in ${diffDays} days`
  }

  // Count items summary for Insights link requirement
  const expectedThisMonth = upcomingPayments.length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Recurring Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor auto-detected repeated transactions and schedule manual subscriptions or utility bills.
          </p>
        </div>

        {/* Add Manual Subscription Modal */}
        <Dialog open={manualOpen} onOpenChange={setManualOpen}>
          <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 font-semibold text-xs gap-1.5 shadow-md shadow-primary/10 cursor-pointer" />}>
            <Plus className="size-4" />
            Add Manual Recurring
          </DialogTrigger>
          <DialogContent className="border border-border/80 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md max-w-md w-[95vw]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                Add Recurring Item
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs leading-normal">
                Register a manual recurring payment, subscription (Netflix, Rent, EMI) or regular income stream (Salary).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateManual} className="grid gap-4 mt-2">
              {/* Type Switcher */}
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Payment Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManType('expense')}
                    className={cn(
                      "h-9 rounded-lg border text-xs font-semibold cursor-pointer transition-all",
                      manType === 'expense'
                        ? "bg-destructive/10 border-destructive/30 text-destructive shadow-sm"
                        : "bg-muted/25 border-border hover:bg-muted text-muted-foreground"
                    )}
                  >
                    Expense / Outflow
                  </button>
                  <button
                    type="button"
                    onClick={() => setManType('income')}
                    className={cn(
                      "h-9 rounded-lg border text-xs font-semibold cursor-pointer transition-all",
                      manType === 'income'
                        ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                        : "bg-muted/25 border-border hover:bg-muted text-muted-foreground"
                    )}
                  >
                    Income / Salary
                  </button>
                </div>
              </div>

              {/* Merchant & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="merchant-name" className="text-xs font-medium text-muted-foreground">Merchant / Payee</Label>
                  <Input
                    id="merchant-name"
                    value={manMerchant}
                    onChange={(e) => setManMerchant(e.target.value)}
                    placeholder="e.g. Netflix, landlord"
                    className="bg-muted/15 border-border focus-visible:ring-primary/40 h-9 text-xs"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="amount-val" className="text-xs font-medium text-muted-foreground">Amount</Label>
                  <Input
                    id="amount-val"
                    value={manAmount}
                    onChange={(e) => setManAmount(e.target.value)}
                    placeholder="e.g. 649"
                    className="bg-muted/15 border-border focus-visible:ring-primary/40 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Category & Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                  <Select value={manCategory} onValueChange={setManCategory}>
                    <SelectTrigger className="bg-muted/15 border-border/50 h-9 text-xs text-left">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border text-popover-foreground p-1 shadow-xl">
                      {categoryList
                        .filter(c => (manType === 'income' ? c.id === 'income' : c.id !== 'income'))
                        .map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Frequency</Label>
                  <Select value={manFrequency} onValueChange={(v: any) => setManFrequency(v)}>
                    <SelectTrigger className="bg-muted/15 border-border/50 h-9 text-xs text-left">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border text-popover-foreground p-1 shadow-xl">
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Start Date & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="start-date" className="text-xs font-medium text-muted-foreground">Last Occurrence Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={manStartDate}
                    onChange={(e) => setManStartDate(e.target.value)}
                    className="bg-muted/15 border-border focus-visible:ring-primary/40 h-9 text-xs"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                  <Select value={manPayment} onValueChange={setManPayment}>
                    <SelectTrigger className="bg-muted/15 border-border/50 h-9 text-xs text-left">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border text-popover-foreground p-1 shadow-xl">
                      {paymentMethods.map(mode => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="grid gap-1.5">
                <Label htmlFor="man-notes" className="text-xs font-medium text-muted-foreground">Notes (Optional)</Label>
                <Textarea
                  id="man-notes"
                  value={manNotes}
                  onChange={(e) => setManNotes(e.target.value)}
                  placeholder="Subscription plan details, billing rules, EMI installments..."
                  className="bg-muted/15 border-border focus-visible:ring-primary/40 min-h-[60px] text-xs resize-none"
                />
              </div>

              {manError && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-[11px] text-destructive flex items-center gap-1.5 leading-normal shrink-0">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span>{manError}</span>
                </div>
              )}

              <DialogFooter className="mt-2 flex gap-2">
                <DialogClose render={<Button type="button" variant="outline" className="border-border/60 hover:bg-muted/40 h-9 text-xs px-4" />}>
                  Cancel
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 font-semibold text-xs px-5 shadow-lg shadow-primary/10 cursor-pointer">
                  Save Subscription
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs Controller */}
      <div className="flex border-b border-border/80 gap-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            "pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer",
            activeTab === 'upcoming'
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Upcoming Expected Payments ({upcomingPayments.length})
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={cn(
            "pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer",
            activeTab === 'patterns'
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Detected Recurring Patterns ({recurringItems.length})
        </button>
      </div>

      {/* Main content body */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Scanning transaction history for repeated signatures...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: Upcoming expected payments */}
          {activeTab === 'upcoming' && (
            <>
              {upcomingPayments.length === 0 ? (
                <Card className="border border-border/70 p-12 text-center py-20 bg-card/65 backdrop-blur-xs max-w-md mx-auto">
                  <div className="size-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground mx-auto">
                    <Clock className="size-6" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">No upcoming items expected</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Import more bank statements or log manual recurring subscriptions to schedule expected payments in the next 30 days.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {upcomingPayments.map(p => {
                    const isIncome = p.transaction_type === 'income'
                    const catInfo = categories[p.category as CategoryId] || { label: p.category }

                    return (
                      <Card
                        key={p.id}
                        className={cn(
                          "border p-4.5 shadow-xs bg-card/85 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]",
                          isIncome ? "border-primary/20 bg-primary/[0.01]" : "border-border/80"
                        )}
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-sm text-foreground truncate max-w-[150px]" title={p.merchant}>
                              {p.merchant}
                            </span>
                            <span className={cn(
                              "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
                              isIncome ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                              {p.frequency}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pt-1.5">
                            <span className="text-xs text-muted-foreground font-medium">
                              {catInfo.label}
                            </span>
                            <span className={cn(
                              "tabnum text-base font-bold",
                              isIncome ? "text-primary" : "text-foreground"
                            )}>
                              {isIncome ? '+' : '-'}{formatINR(p.amount)}
                            </span>
                          </div>
                        </div>

                        {/* Due Footer */}
                        <div className="border-t border-border/40 pt-3 mt-3 flex justify-between items-center text-[10px] text-muted-foreground shrink-0 leading-none">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3.5 text-primary/70" />
                            <span>Due Date: <strong className="text-foreground">{p.dueDate}</strong></span>
                          </div>
                          <span className={cn(
                            "font-bold",
                            isIncome ? "text-primary" : "text-amber-500"
                          )}>
                            {getDaysDiffStr(p.dueDate)}
                          </span>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: Detected recurring patterns list */}
          {activeTab === 'patterns' && (
            <>
              {recurringItems.length === 0 ? (
                <Card className="border border-border/70 p-12 text-center py-20 bg-card/65 backdrop-blur-xs max-w-md mx-auto">
                  <div className="size-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground mx-auto">
                    <AlertTriangle className="size-6" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">No repeated signatures detected</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Add or import more transactions to auto-detect recurring patterns like rent, monthly subscriptions, or salary credits.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {recurringItems.map(item => {
                    const isIncome = item.transaction_type === 'income'
                    const isManual = item.source === 'manual'
                    const catInfo = categories[item.category as CategoryId] || { label: item.category }

                    return (
                      <Card
                        key={item.id}
                        className={cn(
                          "border p-5 bg-card/85 shadow-sm relative flex flex-col justify-between gap-4",
                          item.status === 'ignored' && "opacity-50 border-dashed",
                          item.status === 'not-recurring' && "opacity-40 border-dashed"
                        )}
                      >
                        <div className="space-y-3">
                          {/* Row 1: Merchant & Source Pill */}
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-base text-foreground leading-tight">{item.merchant}</h3>
                                <span className={cn(
                                  "text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded",
                                  isManual ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-primary/10 text-primary border border-primary/20"
                                )}>
                                  {isManual ? 'Manual' : 'Detected'}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{catInfo.label} • {item.frequency}</p>
                            </div>

                            <span className={cn(
                              "tabnum text-lg font-bold shrink-0",
                              isIncome ? "text-primary" : "text-foreground"
                            )}>
                              {isIncome ? '+' : '-'}{formatINR(item.amount)}
                            </span>
                          </div>

                          {/* Row 2: Metadata stats grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs border border-border/40 rounded-lg p-2.5 bg-muted/10">
                            <div>
                              <span className="text-[9px] text-muted-foreground block uppercase">Last Occurrence</span>
                              <span className="font-medium text-foreground text-[11px] block mt-0.5">{item.last_occurrence}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-muted-foreground block uppercase">Next Expected</span>
                              <span className="font-medium text-foreground text-[11px] block mt-0.5">{item.estimated_next}</span>
                            </div>
                          </div>

                          {/* Explanation string */}
                          {item.explanation && (
                            <div className="text-[11px] text-primary bg-primary/5 border border-primary/10 rounded-lg p-2.5 flex items-start gap-1.5 shadow-xs leading-normal">
                              <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
                              <span>{item.explanation}</span>
                            </div>
                          )}

                          {/* Confidence Score for auto-detected */}
                          {!isManual && (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-muted-foreground">Pattern Confidence Score</span>
                                <span className="font-bold text-foreground">{item.confidence}%</span>
                              </div>
                              <div className="w-full bg-muted border border-border/40 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    item.confidence >= 80 ? "bg-emerald-500" : item.confidence >= 65 ? "bg-primary" : "bg-amber-500"
                                  )}
                                  style={{ width: `${item.confidence}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-[11px] text-muted-foreground bg-muted/10 rounded border border-border/30 p-2 italic leading-normal">
                              {item.notes}
                            </p>
                          )}
                        </div>

                        {/* Controls bar */}
                        <div className="border-t border-border/40 pt-3 flex justify-between items-center gap-2">
                          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 leading-none uppercase tracking-wider">
                            Status: <strong className={cn(
                              item.status === 'active' ? "text-emerald-500" : item.status === 'ignored' ? "text-amber-500" : "text-destructive"
                            )}>{item.status}</strong>
                          </span>

                          <div className="flex gap-1.5">
                            {isManual ? (
                              <Button
                                variant="ghost"
                                onClick={() => handleDeleteManual(item.id)}
                                className="h-7 px-2 text-destructive border border-destructive/25 hover:bg-destructive/15 gap-1 text-[10px]"
                              >
                                <Trash2 className="size-3.5" />
                                Delete
                              </Button>
                            ) : (
                              <>
                                {item.status !== 'active' && (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleConfirmPattern(item.id)}
                                    className="h-7 px-2 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/10 text-[10px]"
                                  >
                                    Confirm
                                  </Button>
                                )}
                                {item.status === 'active' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleIgnorePattern(item.id)}
                                      className="h-7 px-2 border border-border text-muted-foreground hover:bg-muted/40 text-[10px]"
                                    >
                                      Ignore
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleNotRecurringPattern(item.id)}
                                      className="h-7 px-2 border border-destructive/20 text-destructive hover:bg-destructive/10 text-[10px]"
                                    >
                                      Dismiss
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}

        </div>
      )}
    </div>
  )
}
