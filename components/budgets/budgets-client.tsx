'use client'

import * as React from 'react'
import {
  Calendar,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { CreateBudgetDialog } from './create-budget-dialog'
import { categories, type CategoryId } from '@/lib/data'
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/utils'

interface DBBudget {
  id: string
  user_id: string
  category: string
  budget_amount: number
  month: string // date string YYYY-MM-DD
  created_at: string
  updated_at: string
}

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

export function BudgetsClient({ userId }: { userId: string }) {
  const [budgets, setBudgets] = React.useState<DBBudget[]>([])
  const [transactions, setTransactions] = React.useState<DBTransaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Current selected month: default to current year-month (e.g. "2026-07")
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    return `${yyyy}-${mm}`
  })

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // 1. Fetch budgets for user (all months, we will filter in client-side for dynamic switching)
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)

      if (budgetsError) throw budgetsError

      // 2. Fetch transactions for user (all expenses, or all transactions for matching month)
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', 'expense')

      if (txError) throw txError

      setBudgets(budgetsData || [])
      setTransactions(txData || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load budgets data.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter budgets for the currently selected month
  const activeBudgets = React.useMemo(() => {
    return budgets.filter((b) => b.month.slice(0, 7) === selectedMonth)
  }, [budgets, selectedMonth])

  // Map spending for the current month
  const budgetsWithSpending = React.useMemo(() => {
    return activeBudgets.map((budget) => {
      // Sum up matching expenses for this category in this month
      const spent = transactions
        .filter(
          (tx) =>
            tx.category === budget.category &&
            tx.transaction_date.slice(0, 7) === selectedMonth
        )
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

      const remaining = budget.budget_amount - spent
      const percent = budget.budget_amount > 0 ? (spent / budget.budget_amount) * 100 : 0

      // Determine visual state
      let status: 'healthy' | 'warning' | 'danger' = 'healthy'
      if (percent >= 100) {
        status = 'danger'
      } else if (percent >= 80) {
        status = 'warning'
      }

      return {
        ...budget,
        spent,
        remaining,
        percent,
        status,
      }
    })
  }, [activeBudgets, transactions, selectedMonth])

  // Calculate totals
  const totals = React.useMemo(() => {
    let limitTotal = 0
    let spentTotal = 0
    budgetsWithSpending.forEach((b) => {
      limitTotal += b.budget_amount
      spentTotal += b.spent
    })
    const remainingTotal = limitTotal - spentTotal
    const overallPercent = limitTotal > 0 ? (spentTotal / limitTotal) * 100 : 0
    return {
      limitTotal,
      spentTotal,
      remainingTotal,
      overallPercent,
    }
  }, [budgetsWithSpending])

  // Format month to display (e.g. "2026-07" to "July 2026")
  const formattedMonthDisplay = React.useMemo(() => {
    if (!selectedMonth) return ''
    const [yyyy, mm] = selectedMonth.split('-')
    const date = new Date(parseInt(yyyy), parseInt(mm) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [selectedMonth])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Monthly Budgets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set and track monthly spending targets by category to control your outflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month Selector Filter */}
          <div className="flex items-center gap-2 bg-muted/20 border border-border/60 rounded-lg px-2 py-1">
            <Calendar className="size-4 text-muted-foreground" />
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium w-[130px] [color-scheme:dark] h-7"
            />
          </div>
          <CreateBudgetDialog
            userId={userId}
            onSuccess={fetchData}
            defaultMonth={selectedMonth}
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <span className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-medium">Loading budgets...</p>
        </div>
      ) : budgetsWithSpending.length === 0 ? (
        /* Empty State */
        <Card className="border border-border/80 bg-card/90 shadow-xl backdrop-blur-sm p-12 text-center py-20 max-w-md mx-auto">
          <div className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary mx-auto shadow-inner">
            <Wallet className="size-7 text-primary" />
          </div>
          <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
            No budgets created for {formattedMonthDisplay}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Take control of your spending by setting your first category limit for this month.
          </p>
          <div className="mt-6">
            <CreateBudgetDialog
              userId={userId}
              onSuccess={fetchData}
              defaultMonth={selectedMonth}
            />
          </div>
        </Card>
      ) : (
        /* Content State */
        <div className="space-y-6">
          {/* Summary Banner Card */}
          <Card className="border border-border/80 bg-card/90 p-6 shadow-md backdrop-blur-sm relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="grid gap-4 md:grid-cols-4 items-center relative">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overall Spending</p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  {formatINR(totals.spentTotal)}
                </h2>
                <p className="text-xs text-muted-foreground">
                  spent of {formatINR(totals.limitTotal)} limit
                </p>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Usage Progress</span>
                  <span>{Math.round(totals.overallPercent)}%</span>
                </div>
                <Progress
                  value={totals.overallPercent}
                  className="h-1 w-full"
                  style={{
                    '--primary': totals.overallPercent >= 100
                      ? 'var(--destructive)'
                      : totals.overallPercent >= 80
                      ? 'oklch(0.79 0.16 85)'
                      : 'var(--primary)',
                  } as React.CSSProperties}
                />
              </div>

              <div className="text-right md:pr-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Remaining</p>
                <p className={cn(
                  "text-2xl font-bold tracking-tight mt-1",
                  totals.remainingTotal >= 0 ? "text-primary" : "text-destructive"
                )}>
                  {totals.remainingTotal >= 0 ? '' : '-'}{formatINR(Math.abs(totals.remainingTotal))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totals.remainingTotal >= 0 ? 'available' : 'over limit'}
                </p>
              </div>
            </div>
          </Card>

          {/* Budgets Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgetsWithSpending.map((budget) => {
              const catId = budget.category as CategoryId
              const cat = categories[catId] || {
                label: budget.category,
                icon: Wallet,
                color: 'var(--chart-3)',
              }
              const IconComponent = cat.icon
              const isOver = budget.spent > budget.budget_amount

              return (
                <Card
                  key={budget.id}
                  className="relative overflow-hidden border border-border/80 bg-card/95 p-5 shadow-sm transition-all hover:shadow-lg hover:border-border/100"
                >
                  {/* Visual health state marker */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 w-full h-[3px]",
                      budget.status === 'danger'
                        ? "bg-destructive"
                        : budget.status === 'warning'
                        ? "bg-amber-500"
                        : "bg-primary"
                    )}
                  />

                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        color: cat.color,
                        backgroundColor: `${cat.color}15`,
                        borderColor: `${cat.color}25`,
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                    >
                      <IconComponent className="size-3.5" />
                      {cat.label}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {formattedMonthDisplay.split(' ')[0]}
                    </span>
                  </div>

                  {/* Amount Details */}
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="tabnum text-2xl font-bold tracking-tight text-foreground">
                      {formatINR(budget.spent)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {formatINR(budget.budget_amount)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <Progress
                      value={budget.percent}
                      className="h-1 w-full"
                      style={{
                        '--primary': budget.status === 'danger'
                          ? 'var(--destructive)'
                          : budget.status === 'warning'
                          ? 'oklch(0.79 0.16 85)'
                          : 'var(--primary)',
                      } as React.CSSProperties}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">
                        {Math.round(budget.percent)}% Used
                      </span>
                      {isOver ? (
                        <span className="flex items-center gap-1 text-destructive font-medium">
                          <AlertTriangle className="size-3" />
                          {formatINR(budget.spent - budget.budget_amount)} over limit
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <CheckCircle2 className="size-3" />
                          {formatINR(budget.remaining)} available
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
