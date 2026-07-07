'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Target,
  Receipt,
  Plus,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StatCard } from './stat-card'
import { ScoreRing } from './score-ring'
import { CashflowChart } from './cashflow-chart'
import { CategoryChart } from './category-chart'
import { InsightList } from './insight-list'
import { categories, type CategoryId, type Insight } from '@/lib/data'
import { formatINR, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { DailyBriefingWidget } from './daily-briefing-card'

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

interface DBBudget {
  id: string
  user_id: string
  category: string
  budget_amount: number
  month: string
  created_at: string
  updated_at: string
}

interface DBGoal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  monthly_contribution: number
  target_date: string
  created_at: string
  updated_at: string
}

export function DashboardClient({ userId }: { userId: string }) {
  const [transactions, setTransactions] = React.useState<DBTransaction[]>([])
  const [budgets, setBudgets] = React.useState<DBBudget[]>([])
  const [goals, setGoals] = React.useState<DBGoal[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // 1. Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)

      if (txError) throw txError

      // 2. Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)

      if (budgetsError) throw budgetsError

      // 3. Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)

      if (goalsError) throw goalsError

      setTransactions(txData || [])
      setBudgets(budgetsData || [])
      setGoals(goalsData || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const currentMonth = React.useMemo(() => new Date().toISOString().slice(0, 7), [])

  // Calculations
  const calculatedData = React.useMemo(() => {
    const incomeTx = transactions.filter((t) => t.transaction_type === 'income')
    const expenseTx = transactions.filter((t) => t.transaction_type === 'expense')

    const totalIncome = incomeTx.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalExpenses = expenseTx.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalBalance = totalIncome - totalExpenses

    const monthlyIncomeTx = incomeTx.filter((t) => t.transaction_date.slice(0, 7) === currentMonth)
    const monthlyExpenseTx = expenseTx.filter((t) => t.transaction_date.slice(0, 7) === currentMonth)

    const monthlyIncome = monthlyIncomeTx.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const monthlyExpenses = monthlyExpenseTx.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const netMonthlyCashflow = monthlyIncome - monthlyExpenses

    // Savings rate calculation
    let savingsRateStr = '—'
    let savingsRateValue = 0
    if (monthlyIncome > 0) {
      savingsRateValue = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
      savingsRateStr = `${Math.round(savingsRateValue)}%`
    }

    // Recent activity (Sorted by transaction_date desc, created_at desc)
    const recentTransactions = [...transactions]
      .sort((a, b) => {
        const dateCompare = b.transaction_date.localeCompare(a.transaction_date)
        if (dateCompare !== 0) return dateCompare
        return b.created_at.localeCompare(a.created_at)
      })
      .slice(0, 5)

    // Current Month Budgets & Adherence
    const activeBudgets = budgets.filter((b) => b.month.slice(0, 7) === currentMonth)
    let totalBudgeted = 0
    let totalBudgetSpent = 0
    let budgetsNearLimit = 0
    let budgetsOverLimit = 0

    const budgetsWithSpent = activeBudgets.map((b) => {
      const spent = expenseTx
        .filter((t) => t.category === b.category && t.transaction_date.slice(0, 7) === currentMonth)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      totalBudgeted += b.budget_amount
      totalBudgetSpent += spent

      const ratio = b.budget_amount > 0 ? spent / b.budget_amount : 0
      if (ratio >= 1.0) {
        budgetsOverLimit++
      } else if (ratio >= 0.8) {
        budgetsNearLimit++
      }

      return { ...b, spent }
    })

    const budgetsAlertsCount = budgetsNearLimit + budgetsOverLimit

    // Active Savings Goals
    const activeGoals = goals.filter((g) => g.current_amount < g.target_amount)
    const completedGoals = goals.filter((g) => g.current_amount >= g.target_amount)

    // 6-Month Cash Flow chart data
    const cashFlowChartData: { month: string; income: number; expenses: number }[] = []
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const label = d.toLocaleDateString('en-US', { month: 'short' })
      const yyyymm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

      const mIncome = incomeTx
        .filter((t) => t.transaction_date.slice(0, 7) === yyyymm)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const mExpense = expenseTx
        .filter((t) => t.transaction_date.slice(0, 7) === yyyymm)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      cashFlowChartData.push({
        month: label,
        income: mIncome,
        expenses: mExpense,
      })
    }

    // Category breakdown for current month expenses
    const categoryTotals: Record<string, number> = {}
    monthlyExpenseTx.forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Math.abs(tx.amount)
    })

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([catKey, value]) => {
        const cat = categories[catKey as CategoryId] || { label: catKey }
        return {
          id: catKey,
          name: cat.label,
          value,
          percent: monthlyExpenses > 0 ? Math.round((value / monthlyExpenses) * 100) : 0,
        }
      })
      .sort((a, b) => b.value - a.value)

    // Calculate Health Score
    // 1. Savings Rate Component (max 40pts)
    let scoreSavings = 0
    if (monthlyIncome > 0) {
      if (savingsRateValue >= 30) scoreSavings = 40
      else if (savingsRateValue >= 20) scoreSavings = 30
      else if (savingsRateValue >= 10) scoreSavings = 20
      else if (savingsRateValue > 0) scoreSavings = 10
    }
    // 2. Budget Adherence Component (max 40pts)
    let scoreBudget = 40 // Default to full points if no budgets exist (neutral treatment)
    if (activeBudgets.length > 0) {
      scoreBudget = Math.round(40 * (1 - budgetsOverLimit / activeBudgets.length))
    }
    // 3. Goal Progress Component (max 20pts)
    let scoreGoals = 0
    if (goals.length > 0) {
      scoreGoals = Math.min(20, goals.length * 10) // 10 pts per goal, max 20
    }

    const healthScore = Math.max(0, Math.min(100, scoreSavings + scoreBudget + scoreGoals))

    // Insights Panel Generation (Deterministic)
    const insightsList: Insight[] = []

    if (transactions.length === 0) {
      insightsList.push({
        id: 'in-onboard',
        tone: 'neutral',
        title: 'Welcome to NexaFi!',
        body: 'Add your first transaction on the Transactions page to start generating financial insights.',
      })
    } else {
      // High dining ratio check
      const foodSpend = categoryTotals['food'] || 0
      const foodRatio = monthlyExpenses > 0 ? foodSpend / monthlyExpenses : 0
      if (foodSpend > 0 && foodRatio > 0.25) {
        insightsList.push({
          id: 'in-food',
          tone: 'warning',
          title: 'Food & Dining spending is high',
          body: `Your food expenses make up ${Math.round(foodRatio * 100)}% of your monthly outflows. Consider adjusting your dining habits or setting a target budget.`,
        })
      }

      // Budget Success
      if (activeBudgets.length > 0 && budgetsOverLimit === 0 && monthlyExpenses > 0) {
        insightsList.push({
          id: 'in-budget-ok',
          tone: 'positive',
          title: 'On track with budgets',
          body: 'Great job! All your category spending is currently within the budget limits you set.',
        })
      }

      // Savings Rate
      if (savingsRateValue > 25) {
        insightsList.push({
          id: 'in-saving-rate',
          tone: 'positive',
          title: 'Excellent savings rate',
          body: `You saved ${Math.round(savingsRateValue)}% of your monthly income, exceeding the recommended 20% savings threshold.`,
        })
      }

      // Recurring Merchants
      const merchantCounts: Record<string, number> = {}
      transactions.forEach((tx) => {
        merchantCounts[tx.merchant] = (merchantCounts[tx.merchant] || 0) + 1
      })
      const recurringMerchant = Object.entries(merchantCounts).find(([_, count]) => count >= 2)
      if (recurringMerchant) {
        insightsList.push({
          id: 'in-recurring',
          tone: 'neutral',
          title: 'Recurring pattern identified',
          body: `We noticed multiple transactions for "${recurringMerchant[0]}". Double check your subscriptions or frequent outflows to stay optimized.`,
        })
      }
    }

    // Fallback if list is short
    if (insightsList.length < 2) {
      insightsList.push({
        id: 'in-goals-default',
        tone: 'positive',
        title: 'Plan for the future',
        body: 'Setting long-term goals and adding monthly contributions is the best way to build sustainable wealth.',
      })
    }

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRateStr,
      netMonthlyCashflow,
      recentTransactions,
      totalBudgeted,
      totalBudgetSpent,
      budgetsAlertsCount,
      activeGoals,
      completedGoals,
      cashFlowChartData,
      categoryBreakdown,
      healthScore,
      insightsList,
    }
  }, [transactions, budgets, goals, currentMonth])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <span className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm font-medium">Loading workspace data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A real-time breakdown of your income, expenses, budgets, and savings goals.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Balance"
          value={formatINR(calculatedData.totalBalance)}
          icon={Wallet}
          hint="All time net balance"
        />
        <StatCard
          label="Monthly Income"
          value={formatINR(calculatedData.monthlyIncome)}
          icon={ArrowUpRight}
          hint="For the current month"
        />
        <StatCard
          label="Monthly Expenses"
          value={formatINR(calculatedData.monthlyExpenses)}
          icon={ArrowDownRight}
          hint="For the current month"
        />
        <StatCard
          label="Savings Rate"
          value={calculatedData.savingsRateStr}
          icon={TrendingUp}
          hint="Income saved this month"
        />
      </div>

      {/* Daily AI Briefing Widget */}
      <DailyBriefingWidget />

      {/* Charts & Health Score Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Cashflow Chart Card */}
        <Card className="md:col-span-2 border border-border/80 bg-card/90 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cash Flow (Last 6 Months)</h3>
          </div>
          <CashflowChart data={calculatedData.cashFlowChartData} />
        </Card>

        {/* Health Score Ring Card */}
        <Card className="border border-border/80 bg-card/90 p-5 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 w-full text-left">Financial Health</h3>
          <ScoreRing score={calculatedData.healthScore} />
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed max-w-[200px]">
            Your score reflects your savings rate, budget habits, and goal progress.
          </p>
          <span className="text-[10px] text-muted-foreground/60 mt-1 block">
            This is not professional financial advice.
          </span>
        </Card>
      </div>

      {/* Breakdown and Activity Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Breakdown Chart Card */}
        <Card className="border border-border/80 bg-card/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Spending Breakdown</h3>
            {calculatedData.categoryBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 gap-2 text-muted-foreground">
                <Receipt className="size-8 opacity-40" />
                <p className="text-xs">No expense transactions recorded this month.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 items-center">
                <CategoryChart data={calculatedData.categoryBreakdown} />
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {calculatedData.categoryBreakdown.map((item, idx) => {
                    const catId = item.id as CategoryId
                    const cat = categories[catId] || { color: 'var(--chart-3)' }
                    return (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-muted-foreground font-medium truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{item.percent}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-border/80 bg-card/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-primary" nativeButton={false} render={<Link href="/transactions" />}>
                View all
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </div>
            {calculatedData.recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 gap-2 text-muted-foreground">
                <Receipt className="size-8 opacity-40" />
                <p className="text-xs">No transactions recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 text-xs">
                {calculatedData.recentTransactions.map((tx) => {
                  const isIncome = tx.transaction_type === 'income'
                  const catId = tx.category as CategoryId
                  const cat = categories[catId] || { color: 'var(--chart-3)' }
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3 group hover:bg-muted/5 transition-all">
                      <div className="min-w-0 pr-2">
                        <p className="font-medium text-foreground truncate">{tx.merchant}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(tx.transaction_date)}</p>
                      </div>
                      <span className={cn(
                        "tabnum font-semibold text-sm",
                        isIncome ? "text-primary" : "text-foreground"
                      )}>
                        {isIncome ? '+' : '-'}{formatINR(tx.amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Budgets, Goals, and Insights grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Budgets Health Widget */}
        <Card className="border border-border/80 bg-card/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Budget Health</h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-primary" nativeButton={false} render={<Link href="/budgets" />}>
                Manage
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>

            {calculatedData.totalBudgeted === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1">
                <AlertTriangle className="size-4 opacity-40" />
                <p>No budgets set for this month.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground">Total Budget Spent</span>
                    <span className="font-semibold text-foreground">
                      {formatINR(calculatedData.totalBudgetSpent)} / {formatINR(calculatedData.totalBudgeted)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (calculatedData.totalBudgetSpent / calculatedData.totalBudgeted) * 100)}
                    className="h-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2">
                  <div className="rounded-lg bg-muted/20 p-2.5 border border-border/30">
                    <p className="text-muted-foreground text-[10px] uppercase font-semibold">Remaining</p>
                    <p className={cn(
                      "text-sm font-bold mt-0.5",
                      calculatedData.totalBudgeted - calculatedData.totalBudgetSpent >= 0 ? "text-primary" : "text-destructive"
                    )}>
                      {formatINR(calculatedData.totalBudgeted - calculatedData.totalBudgetSpent)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/20 p-2.5 border border-border/30">
                    <p className="text-muted-foreground text-[10px] uppercase font-semibold">Alerts</p>
                    <p className={cn(
                      "text-sm font-bold mt-0.5",
                      calculatedData.budgetsAlertsCount > 0 ? "text-destructive" : "text-primary"
                    )}>
                      {calculatedData.budgetsAlertsCount}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Goals Summary Widget */}
        <Card className="border border-border/80 bg-card/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Goals</h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-primary" nativeButton={false} render={<Link href="/goals" />}>
                View
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>

            {calculatedData.activeGoals.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1">
                <Target className="size-4 opacity-40" />
                {calculatedData.completedGoals.length > 0 ? (
                  <p>All goals completed! 🎉</p>
                ) : (
                  <p>No active savings goals.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {calculatedData.activeGoals.slice(0, 3).map((goal) => {
                  const percent = Math.min(100, goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0)
                  return (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-foreground truncate max-w-[120px]">{goal.title}</span>
                        <span className="text-muted-foreground">{Math.round(percent)}%</span>
                      </div>
                      <Progress value={percent} className="h-1" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Insights Panel */}
        <Card className="border border-border/80 bg-card/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Insights</h3>
            </div>
            <InsightList insights={calculatedData.insightsList} limit={2} />
          </div>
        </Card>
      </div>
    </div>
  )
}
