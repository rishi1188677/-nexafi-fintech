'use client'

import * as React from 'react'
import {
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Percent,
  Category,
  HelpCircle,
  Loader2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Target,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { categories, categoryList, type CategoryId } from '@/lib/data'
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/utils'
import { detectRecurringPatterns, getUpcomingPayments } from '@/lib/recurring-helper'

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
}

interface DBBudget {
  id: string
  user_id: string
  category: string
  budget_amount: number
  month: string // YYYY-MM-DD
}

interface DBGoal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  monthly_contribution: number
  target_date: string // YYYY-MM-DD
}

export function InsightsClient({ userId }: { userId: string }) {
  const [transactions, setTransactions] = React.useState<DBTransaction[]>([])
  const [budgets, setBudgets] = React.useState<DBBudget[]>([])
  const [goals, setGoals] = React.useState<DBGoal[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // AI Chat simulation states
  const [selectedQuestion, setSelectedQuestion] = React.useState<string | null>(null)
  const [aiThinking, setAiThinking] = React.useState(false)
  const [aiResponse, setAiResponse] = React.useState<string | null>(null)

  // Local preferences for recurring payments
  const [recurringPrefs, setRecurringPrefs] = React.useState<any>({})

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = `nexafi::recurring::${userId}`
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          setRecurringPrefs(JSON.parse(stored))
        }
      } catch (err) {
        console.error(err)
      }
    }
  }, [userId])

  const recurringCount = React.useMemo(() => {
    const detected = detectRecurringPatterns(transactions, recurringPrefs)
    const upcoming = getUpcomingPayments(detected, 30)
    return upcoming.length
  }, [transactions, recurringPrefs])

  // Fetch all user records
  const fetchAllData = React.useCallback(async () => {
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
      setError(err?.message || 'Failed to load insights records.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  React.useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Deterministic Analytics calculations
  const analytics = React.useMemo(() => {
    const today = new Date()
    const currentMonthStr = today.toISOString().slice(0, 7) // YYYY-MM
    
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`

    // 1. Filter Transactions
    const currMonthTxs = transactions.filter(tx => tx.transaction_date.slice(0, 7) === currentMonthStr)
    const prevMonthTxs = transactions.filter(tx => tx.transaction_date.slice(0, 7) === prevMonthStr)

    // A. Monthly Summary calculations
    const income = currMonthTxs
      .filter(tx => tx.transaction_type === 'income')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    const expenses = currMonthTxs
      .filter(tx => tx.transaction_type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    const netCashflow = income - expenses
    const savingsRate = income > 0 ? Math.max(0, Math.round((netCashflow / income) * 100)) : null

    // Group expenses by category
    const categorySpending: Record<string, number> = {}
    currMonthTxs
      .filter(tx => tx.transaction_type === 'expense')
      .forEach(tx => {
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount)
      })

    let topCategory = 'None'
    let topCategoryAmount = 0
    Object.entries(categorySpending).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt
        topCategory = cat
      }
    })

    const topCategoryLabel = categories[topCategory as CategoryId]?.label || topCategory

    // B. Spending Patterns calculations
    const totalExpenses = currMonthTxs
      .filter(tx => tx.transaction_type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    const categoryBreakdown = Object.entries(categorySpending)
      .map(([cat, amt]) => {
        const percent = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0
        return {
          id: cat as CategoryId,
          label: categories[cat as CategoryId]?.label || cat,
          amount: amt,
          percent,
          color: categories[cat as CategoryId]?.color || 'var(--chart-3)'
        }
      })
      .sort((a, b) => b.amount - a.amount)

    // Top 5 merchants
    const merchantSpending: Record<string, number> = {}
    currMonthTxs
      .filter(tx => tx.transaction_type === 'expense')
      .forEach(tx => {
        const m = tx.merchant.trim()
        merchantSpending[m] = (merchantSpending[m] || 0) + Math.abs(tx.amount)
      })

    const topMerchants = Object.entries(merchantSpending)
      .map(([m, amt]) => ({ merchant: m, amount: amt }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Month-over-month calculation
    const currMonthExpenseTotal = totalExpenses
    const prevMonthExpenseTotal = prevMonthTxs
      .filter(tx => tx.transaction_type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    const hasPreviousMonthData = transactions.some(tx => tx.transaction_date.slice(0, 7) === prevMonthStr)
    let momChangeText = ''
    let momPercent = 0
    if (!hasPreviousMonthData || prevMonthExpenseTotal === 0) {
      momChangeText = 'Not enough data yet'
    } else {
      momPercent = ((currMonthExpenseTotal - prevMonthExpenseTotal) / prevMonthExpenseTotal) * 100
      momChangeText = `${momPercent >= 0 ? '+' : ''}${Math.round(momPercent)}% MoM`
    }

    // High spending warnings
    const spendingWarnings: string[] = []
    categoryBreakdown.forEach(cb => {
      if (cb.percent > 30 && totalExpenses > 0) {
        spendingWarnings.push(`${cb.label} makes up ${Math.round(cb.percent)}% of your expenses this month.`)
      }
      if (cb.amount > 10000) {
        spendingWarnings.push(`You spent ${formatINR(cb.amount)} in ${cb.label} this month.`)
      }
    })

    // C. Budget Intelligence calculations
    const currBudgets = budgets.filter(b => b.month.slice(0, 7) === currentMonthStr)
    let budgetsWithin = 0
    let budgetsNear = 0
    let budgetsOver = 0
    const overBudgetCategories: string[] = []
    let totalBudgetLimit = 0
    let totalSpentInBudgets = 0

    currBudgets.forEach(b => {
      totalBudgetLimit += b.budget_amount
      const spent = categorySpending[b.category] || 0
      totalSpentInBudgets += spent
      const pct = b.budget_amount > 0 ? (spent / b.budget_amount) * 100 : 0
      if (pct > 100) {
        budgetsOver++
        const catLabel = categories[b.category as CategoryId]?.label || b.category
        overBudgetCategories.push(catLabel)
      } else if (pct >= 80) {
        budgetsNear++
      } else {
        budgetsWithin++
      }
    })

    const safeToSpend = Math.max(0, totalBudgetLimit - totalSpentInBudgets)

    // D. Goal Progress calculations
    const activeGoals = goals.filter(g => g.current_amount < g.target_amount)
    const totalSavedAcrossGoals = goals.reduce((sum, g) => sum + g.current_amount, 0)
    let goalsOnTrack = 0
    let goalsNeedingContribution = 0

    activeGoals.forEach(g => {
      const remaining = g.target_amount - g.current_amount
      if (g.monthly_contribution > 0) {
        const targetDateObj = new Date(g.target_date)
        const monthsDiff = (targetDateObj.getFullYear() - today.getFullYear()) * 12 + (targetDateObj.getMonth() - today.getMonth())
        const monthsNeeded = Math.ceil(remaining / g.monthly_contribution)
        
        if (monthsNeeded <= monthsDiff) {
          goalsOnTrack++
        } else {
          goalsNeedingContribution++
        }
      } else {
        goalsNeedingContribution++
      }
    })

    // E. Smart Insight Feed generation
    const feed: { tone: 'positive' | 'warning' | 'neutral'; title: string; body: string }[] = []
    
    // Top expense insight
    if (topCategoryAmount > 0) {
      feed.push({
        tone: 'neutral',
        title: 'Top spending category',
        body: `${topCategoryLabel} is your highest expense category this month, totaling ${formatINR(topCategoryAmount)}.`
      })
    }

    // Budget overrun warnings
    currBudgets.forEach(b => {
      const spent = categorySpending[b.category] || 0
      const catLabel = categories[b.category as CategoryId]?.label || b.category
      if (spent > b.budget_amount) {
        feed.push({
          tone: 'warning',
          title: `${catLabel} limit exceeded`,
          body: `You are over your ${catLabel} budget by ${formatINR(spent - b.budget_amount)}.`
        })
      } else if (spent > 0) {
        feed.push({
          tone: 'positive',
          title: `${catLabel} budget on track`,
          body: `You are within your ${catLabel} budget with ${formatINR(b.budget_amount - spent)} remaining.`
        })
      }
    })

    // Goals progress check
    activeGoals.slice(0, 2).forEach(g => {
      const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0
      feed.push({
        tone: 'positive',
        title: `Progress on ${g.title}`,
        body: `Your goal "${g.title}" is currently ${pct}% complete (${formatINR(g.current_amount)} saved).`
      })
    })

    // Savings rate insight
    if (savingsRate !== null) {
      if (savingsRate > 20) {
        feed.push({
          tone: 'positive',
          title: 'Strong savings rate',
          body: `Your savings rate is strong this month at ${savingsRate}%. You are retaining a solid portion of your earnings.`
        })
      } else if (savingsRate <= 0) {
        feed.push({
          tone: 'warning',
          title: 'Negative net flow',
          body: 'Your expenses exceeded your income this month. Focus on reducing discretionary outflows to balance cash flows.'
        })
      }
    }

    // Income alert
    if (income === 0 && currMonthTxs.length > 0) {
      feed.push({
        tone: 'warning',
        title: 'No income recorded',
        body: 'Add income transactions to get more accurate cash-flow analysis and savings rate insights.'
      })
    }

    return {
      income,
      expenses,
      netCashflow,
      savingsRate,
      topCategoryLabel,
      topCategoryAmount,
      categoryBreakdown,
      topMerchants,
      momChangeText,
      momPercent,
      spendingWarnings,
      budgetsWithin,
      budgetsNear,
      budgetsOver,
      overBudgetCategories,
      safeToSpend,
      activeGoalsCount: activeGoals.length,
      totalSavedAcrossGoals,
      goalsOnTrack,
      goalsNeedingContribution,
      feed,
    }
  }, [transactions, budgets, goals])

  // Suggested questions click handler (simulation)
  async function handleQuestionClick(question: string) {
    setSelectedQuestion(question)
    setAiThinking(true)
    setAiResponse(null)

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    setAiThinking(false)
    
    // Prepare answers dynamically using real calculation analytics
    if (question.includes('spending increase')) {
      if (analytics.momChangeText === 'Not enough data yet') {
        setAiResponse('I am currently unable to analyze your month-over-month spending changes because there is not enough transaction history from the previous month. Keep recording transactions, and MoM trends will calculate automatically!')
      } else {
        const direction = analytics.momPercent >= 0 ? 'increased' : 'decreased'
        setAiResponse(`Your total monthly expenses ${direction} by ${Math.round(Math.abs(analytics.momPercent))}% compared to last month. Your top category is "${analytics.topCategoryLabel}" at ${formatINR(analytics.topCategoryAmount)}. Reducing merchant transactions in this category will help lower expenses.`)
      }
    } else if (question.includes('stay within budget')) {
      if (budgets.length === 0) {
        setAiResponse('You have not set up any category budgets yet. Head over to the Budgets page to establish spending targets. This will help you pace and control discretionary outflows.')
      } else {
        setAiResponse(`You currently have ${analytics.budgetsOver} category budgets exceeded and ${analytics.budgetsNear} near limit. Your remaining safe-to-spend limit across all active budgets is ${formatINR(analytics.safeToSpend)}. Setting aside strict limits on your top categories will help prevent overspending.`)
      }
    } else if (question.includes('goals')) {
      if (goals.length === 0) {
        setAiResponse('You have not registered any Savings Goals yet. Go to the Goals page to outline targets (like an Emergency Fund or travel funds) and set up monthly contributions.')
      } else {
        setAiResponse(`You have ${analytics.goalsOnTrack} savings goals on track and ${analytics.goalsNeedingContribution} goals requiring attention (due to missing or low monthly contributions). Total saved across your workspace is ${formatINR(analytics.totalSavedAcrossGoals)}.`)
      }
    } else {
      // Where can I save more?
      if (analytics.topMerchants.length === 0) {
        setAiResponse('I do not have enough expense details to suggest savings. Once you record transactions, I will analyze your top merchants to find recurring or high discretionary items.')
      } else {
        const topM = analytics.topMerchants[0]
        setAiResponse(`Your highest merchant expense this month is with "${topM.merchant}" totaling ${formatINR(topM.amount)}. Trimming or delaying shopping trips or orders at your top merchants could save you significant funds.`)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Financial Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">Generating intelligence from your account activity...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border border-border/80 bg-card/90 p-5 shadow-sm animate-pulse h-[140px]" />
          ))}
        </div>
        <Card className="border border-border/80 bg-card/90 p-5 shadow-sm animate-pulse h-[300px]" />
      </div>
    )
  }

  // If no transactions exist, render empty state
  const isWorkspaceEmpty = transactions.length === 0 && budgets.length === 0 && goals.length === 0

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Financial Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Intelligent, data-driven summaries and savings guidance tailored to your balances.
        </p>
      </div>

      {isWorkspaceEmpty ? (
        <Card className="border border-border/80 bg-card/90 shadow-xl backdrop-blur-sm p-12 text-center py-20 max-w-md mx-auto">
          <div className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary mx-auto shadow-inner">
            <Sparkles className="size-7 text-primary" />
          </div>
          <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
            Workspace is empty
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Record transactions, set budgets, and configure savings goals to see smart insights.
          </p>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Analytics Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section A: Monthly Summary */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {/* Income */}
              <Card className="border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Monthly Income</span>
                <span className="tabnum text-2xl font-bold tracking-tight text-foreground block mt-2">
                  {formatINR(analytics.income)}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="size-3 text-primary mr-0.5" />
                  Recorded credits
                </span>
              </Card>

              {/* Expenses */}
              <Card className="border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Monthly Expenses</span>
                <span className="tabnum text-2xl font-bold tracking-tight text-foreground block mt-2">
                  {formatINR(analytics.expenses)}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center mt-1">
                  <ArrowDownRight className="size-3 text-destructive mr-0.5" />
                  Recorded outflows
                </span>
              </Card>

              {/* Net Cashflow */}
              <Card className="border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Net Cashflow</span>
                <span className={cn(
                  "tabnum text-2xl font-bold tracking-tight block mt-2",
                  analytics.netCashflow >= 0 ? "text-primary" : "text-destructive"
                )}>
                  {analytics.netCashflow >= 0 ? '+' : ''}{formatINR(analytics.netCashflow)}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-1">
                  Retained monthly flow
                </span>
              </Card>

              {/* Savings Rate */}
              <Card className="border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Savings Rate</span>
                <span className="tabnum text-2xl font-bold tracking-tight text-foreground block mt-2">
                  {analytics.savingsRate !== null ? `${analytics.savingsRate}%` : '—'}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-1">
                  Of total monthly income
                </span>
              </Card>

              {/* Top Spending Category */}
              <Card className="border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Top Spending Category</span>
                <span className="text-xl font-bold tracking-tight text-foreground block mt-2 truncate">
                  {analytics.topCategoryLabel}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-1">
                  Amount spent: {formatINR(analytics.topCategoryAmount)}
                </span>
              </Card>

              {/* Recurring Payments expected */}
              <Card className="border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Recurring Payments</span>
                <span className="tabnum text-2xl font-bold tracking-tight text-foreground block mt-2">
                  {recurringCount} expected
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center mt-1">
                  <Calendar className="size-3 text-primary mr-0.5" />
                  Expected in next 30 days
                </span>
              </Card>
            </div>

            {/* Section B: Spending Patterns */}
            <Card className="border border-border/80 bg-card/90 p-6 shadow-xl backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <TrendingUp className="size-5 text-primary" />
                <h2 className="text-lg font-medium text-foreground">Spending Patterns</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Category Breakdown (Visual Bars) */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category Share</h3>
                  {analytics.categoryBreakdown.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No category expenses recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.categoryBreakdown.slice(0, 5).map(cb => (
                        <div key={cb.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-foreground">{cb.label}</span>
                            <span className="text-muted-foreground">{Math.round(cb.percent)}% ({formatINR(cb.amount)})</span>
                          </div>
                          <Progress
                            value={cb.percent}
                            className="h-1 w-full bg-muted/40"
                            style={{ '--primary': cb.color } as React.CSSProperties}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* MoM Change & Top Merchants */}
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">MoM Spending Change</h3>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className={cn(
                        "text-xl font-bold tracking-tight",
                        analytics.momChangeText === 'Not enough data yet'
                          ? "text-muted-foreground"
                          : analytics.momPercent >= 0
                          ? "text-destructive"
                          : "text-primary"
                      )}>
                        {analytics.momChangeText}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top 5 Merchants</h3>
                    {analytics.topMerchants.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No merchant transactions.</p>
                    ) : (
                      <div className="space-y-2 text-xs">
                        {analytics.topMerchants.map((tm, idx) => (
                          <div key={tm.merchant} className="flex justify-between items-center py-1 border-b border-border/20 last:border-b-0">
                            <span className="text-foreground">{idx + 1}. {tm.merchant}</span>
                            <span className="font-medium text-foreground">{formatINR(tm.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Warnings Box */}
              {analytics.spendingWarnings.length > 0 && (
                <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-xs text-destructive space-y-1.5">
                  <div className="flex items-center gap-1 font-semibold uppercase tracking-wider">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>Outflow Alerts</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
                    {analytics.spendingWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* Section C: Budget Intelligence */}
            <Card className="border border-border/80 bg-card/90 p-6 shadow-xl backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <Info className="size-5 text-primary" />
                <h2 className="text-lg font-medium text-foreground">Budget Intelligence</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-center">
                <div className="bg-muted/15 border border-border/30 rounded-lg p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Within Limit</span>
                  <span className="text-xl font-bold text-primary block mt-1">{analytics.budgetsWithin}</span>
                </div>
                <div className="bg-muted/15 border border-border/30 rounded-lg p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Near Limit</span>
                  <span className="text-xl font-bold text-amber-500 block mt-1">{analytics.budgetsNear}</span>
                </div>
                <div className="bg-muted/15 border border-border/30 rounded-lg p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Over Budget</span>
                  <span className="text-xl font-bold text-destructive block mt-1">{analytics.budgetsOver}</span>
                </div>
                <div className="bg-muted/15 border border-border/30 rounded-lg p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Safe to Spend</span>
                  <span className="text-xl font-bold text-foreground block mt-1">{formatINR(analytics.safeToSpend)}</span>
                </div>
              </div>

              {analytics.budgetsOver > 0 && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive flex items-center gap-2">
                  <TriangleAlert className="size-4 shrink-0" />
                  <span>
                    Attention: You have exceeded budgets for: <strong>{analytics.overBudgetCategories.join(', ')}</strong>.
                  </span>
                </div>
              )}
            </Card>

            {/* Section D: Goal Progress */}
            <Card className="border border-border/80 bg-card/90 p-6 shadow-xl backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <Target className="size-5 text-primary" />
                <h2 className="text-lg font-medium text-foreground">Goal Projections</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 text-center">
                <div className="bg-muted/15 border border-border/30 rounded-lg p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Total Saved</span>
                  <span className="text-lg font-bold text-foreground block mt-1">{formatINR(analytics.totalSavedAcrossGoals)}</span>
                </div>
                <div className="bg-muted/15 border border-border/30 rounded-lg p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Goals On Track</span>
                  <span className="text-lg font-bold text-primary block mt-1">{analytics.goalsOnTrack}</span>
                </div>
                <div className="bg-muted/15 border border-border/30 rounded-lg p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Needs Attention</span>
                  <span className="text-lg font-bold text-destructive block mt-1">{analytics.goalsNeedingContribution}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Insights & AI Panel */}
          <div className="space-y-8">
            {/* Section E: Smart Insight Feed */}
            <Card className="border border-border/80 bg-card/90 p-5 shadow-xl backdrop-blur-sm space-y-4">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Smart Insights Feed</h2>
              <div className="space-y-3">
                {analytics.feed.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No insights generated yet. Record activity to compile analysis.</p>
                ) : (
                  analytics.feed.map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 rounded-lg border border-border/40 bg-muted/10 p-3 items-start">
                      <div className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-md text-xs",
                        item.tone === 'positive'
                          ? "bg-primary/10 text-primary"
                          : item.tone === 'warning'
                          ? "bg-destructive/10 text-destructive"
                          : "bg-accent/10 text-accent"
                      )}>
                        {item.tone === 'positive' ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : item.tone === 'warning' ? (
                          <TriangleAlert className="size-3.5" />
                        ) : (
                          <Info className="size-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-foreground leading-normal">{item.title}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal text-pretty">{item.body}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* AI Assistant Placeholder Card */}
            <Card className="border border-border/80 bg-card/90 p-5 shadow-xl backdrop-blur-sm space-y-4 relative overflow-hidden">
              <div aria-hidden className="pointer-events-none absolute -right-20 -bottom-20 size-40 rounded-full bg-primary/10 blur-2xl" />
              
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <Sparkles className="size-4 text-primary animate-pulse" />
                <h3 className="text-sm font-semibold text-foreground">Ask NexaFi AI</h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                NexaFi AI is preparing your conversational model. Instant summaries and projections will be added here next.
              </p>

              {/* Suggested Interactive Questions */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Suggested Questions</span>
                <div className="flex flex-col gap-1.5">
                  {[
                    'Why did my spending increase this month?',
                    'How can I stay within budget?',
                    'Am I on track for my goals?',
                    'Where can I save more?',
                  ].map(q => (
                    <button
                      key={q}
                      disabled={aiThinking}
                      onClick={() => handleQuestionClick(q)}
                      className={cn(
                        "text-left text-xs p-2 rounded-md border text-muted-foreground hover:text-foreground transition-all duration-150 cursor-pointer disabled:cursor-not-allowed",
                        selectedQuestion === q
                          ? "bg-primary/10 border-primary/30 text-foreground"
                          : "bg-muted/10 border-border/50 hover:bg-muted/20"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Chat output simulation */}
              {(aiThinking || aiResponse) && (
                <div className="bg-muted/15 border border-border/50 rounded-lg p-3 text-xs mt-4 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Sparkles className="size-3.5 text-primary animate-pulse" />
                    <span>NexaFi Assistant</span>
                  </div>

                  {aiThinking ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                      <Loader2 className="size-3.5 animate-spin text-primary" />
                      <span>Analyzing workspace records...</span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {aiResponse}
                    </p>
                  )}
                </div>
              )}
            </Card>

            {/* Disclaimer */}
            <div className="flex gap-2 text-[10px] text-muted-foreground bg-muted/5 border border-border/30 rounded-lg p-3 leading-normal">
              <Info className="size-3.5 shrink-0 text-muted-foreground mt-0.5" />
              <span>
                <strong>Educational Disclaimer:</strong> Insights are educational in nature and are not intended as financial advice.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
