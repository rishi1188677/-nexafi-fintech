'use client'

import * as React from 'react'
import {
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Target,
  Receipt,
  AlertTriangle,
  Printer,
  Share2,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Coins,
  Bookmark,
  CalendarDays,
  FileText,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { categories, categoryList, type CategoryId } from '@/lib/data'
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/utils'
import { detectRecurringPatterns, getUpcomingPayments, type RecurringItem } from '@/lib/recurring-helper'

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
  target_date: string
}

export function ReportsClient({ userId }: { userId: string }) {
  const [transactions, setTransactions] = React.useState<DBTransaction[]>([])
  const [budgets, setBudgets] = React.useState<DBBudget[]>([])
  const [goals, setGoals] = React.useState<DBGoal[]>([])
  const [recurringPrefs, setRecurringPrefs] = React.useState<any>({})
  const [loading, setLoading] = React.useState(true)

  // Report Month State: Default to current month e.g., "2026-07"
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    return new Date().toISOString().slice(0, 7)
  })

  // Load user data from Supabase
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createClient()
      try {
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)

        const { data: budgetsData } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId)

        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)

        setTransactions(txData || [])
        setBudgets(budgetsData || [])
        setGoals(goalsData || [])
      } catch (err) {
        console.error('Failed to load records for Monthly Report:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId])

  // Fetch recurring configuration from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = `nexafi::recurring::${userId}`
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          setRecurringPrefs(JSON.parse(stored))
        }
      } catch (err) {
        console.error('Failed to load recurring preferences for reports:', err)
      }
    }
  }, [userId])

  // Get available months in transaction history to populate month dropdown selector
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>()
    // Add current month in case history is empty
    months.add(new Date().toISOString().slice(0, 7))

    transactions.forEach(tx => {
      if (tx.transaction_date) {
        months.add(tx.transaction_date.slice(0, 7))
      }
    })

    return Array.from(months).sort((a, b) => b.localeCompare(a))
  }, [transactions])

  // Month navigation handlers
  const handlePrevMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth)
    if (idx < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[idx + 1])
    }
  }

  const handleNextMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth)
    if (idx > 0) {
      setSelectedMonth(availableMonths[idx - 1])
    }
  }

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(Number(year), Number(month) - 1, 1)
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }

  // Calculate monthly stats based on selectedMonth
  const reportData = React.useMemo(() => {
    // 1. Transactions filtered by month
    const monthlyTxs = transactions.filter(tx => tx.transaction_date.slice(0, 7) === selectedMonth)
    const hasData = monthlyTxs.length > 0

    // Outflows & Inflows
    const income = monthlyTxs
      .filter(tx => tx.transaction_type === 'income')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    const expenses = monthlyTxs
      .filter(tx => tx.transaction_type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    const netCashflow = income - expenses
    const savingsRate = income > 0 ? Math.max(0, Math.round((netCashflow / income) * 100)) : 0

    // Top categories
    const categorySpending: Record<string, number> = {}
    monthlyTxs
      .filter(tx => tx.transaction_type === 'expense')
      .forEach(tx => {
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount)
      })

    const topCategories = Object.entries(categorySpending)
      .map(([cat, amt]) => ({
        id: cat,
        label: categories[cat as CategoryId]?.label || cat,
        amount: amt
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Top merchants
    const merchantSpending: Record<string, { amount: number; count: number }> = {}
    monthlyTxs
      .filter(tx => tx.transaction_type === 'expense')
      .forEach(tx => {
        const name = tx.merchant || 'Other'
        if (!merchantSpending[name]) {
          merchantSpending[name] = { amount: 0, count: 0 }
        }
        merchantSpending[name].amount += Math.abs(tx.amount)
        merchantSpending[name].count += 1
      })

    const topMerchants = Object.entries(merchantSpending)
      .map(([merchant, details]) => ({
        name: merchant,
        amount: details.amount,
        count: details.count
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Biggest single expense
    const biggestExpense = [...monthlyTxs]
      .filter(tx => tx.transaction_type === 'expense')
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0] || null

    // Budgets
    const monthlyBudgets = budgets.filter(b => b.month.slice(0, 7) === selectedMonth)
    const budgetsAnalysis = monthlyBudgets.map(b => {
      const spent = transactions
        .filter(t => t.category === b.category && t.transaction_type === 'expense' && t.transaction_date.slice(0, 7) === selectedMonth)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      return {
        category: b.category,
        label: categories[b.category as CategoryId]?.label || b.category,
        limit: b.budget_amount,
        spent,
        ratio: b.budget_amount > 0 ? spent / b.budget_amount : 0
      }
    })

    const withinBudget = budgetsAnalysis.filter(b => b.ratio < 0.8)
    const nearLimit = budgetsAnalysis.filter(b => b.ratio >= 0.8 && b.ratio < 1.0)
    const overBudget = budgetsAnalysis.filter(b => b.ratio >= 1.0)

    const remainingSafeToSpend = Math.max(
      0,
      monthlyBudgets.reduce((sum, b) => sum + b.budget_amount, 0) -
        budgetsAnalysis.reduce((sum, b) => sum + b.spent, 0)
    )

    // Goals completed/progress
    // Contribution can be estimated by looking for savings transfer transactions in selectedMonth
    const totalSavedThisMonth = monthlyTxs
      .filter(t => t.category === 'transfers' || t.merchant.toLowerCase().includes('saving') || (t.notes && t.notes.toLowerCase().includes('savings')))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const activeGoalsCount = goals.length

    // Recurring items
    const detectedRecurring = detectRecurringPatterns(transactions, recurringPrefs)
    const upcomingRecurring = getUpcomingPayments(detectedRecurring, 30)
    const recurringIncome = detectedRecurring
      .filter(item => item.transaction_type === 'income' && item.status === 'active')
      .reduce((sum, item) => sum + item.amount, 0)

    const recurringExpense = detectedRecurring
      .filter(item => item.transaction_type === 'expense' && item.status === 'active')
      .reduce((sum, item) => sum + item.amount, 0)

    // Calculate health score (0-100)
    let healthScore = 50 // Base score
    if (hasData) {
      if (savingsRate >= 30) healthScore += 25
      else if (savingsRate >= 15) healthScore += 15
      else if (savingsRate > 0) healthScore += 5
      else healthScore -= 15 // Saving nothing reduces score

      if (monthlyBudgets.length > 0) {
        const overRatio = overBudget.length / monthlyBudgets.length
        if (overRatio === 0) healthScore += 25 // Excellent budget containment
        else if (overRatio <= 0.25) healthScore += 10
        else if (overRatio > 0.5) healthScore -= 20 // Heavy budget overruns
      } else {
        healthScore += 5 // Minor buffer if no budgets are set
      }

      if (totalSavedThisMonth > 0) healthScore += 5
    }
    healthScore = Math.min(100, Math.max(10, healthScore))

    return {
      hasData,
      income,
      expenses,
      netCashflow,
      savingsRate,
      healthScore,
      topCategories,
      topMerchants,
      biggestExpense,
      budgetsAnalysis,
      withinBudget,
      nearLimit,
      overBudget,
      remainingSafeToSpend,
      totalSavedThisMonth,
      activeGoalsCount,
      recurringIncome,
      recurringExpense,
      upcomingRecurring,
      detectedRecurring
    }
  }, [transactions, budgets, goals, recurringPrefs, selectedMonth])

  // Handle printing/pdf export placeholder
  const handlePrint = () => {
    window.print()
  }

  // Handle copy money story share link
  const [copied, setCopied] = React.useState(false)
  const handleShare = () => {
    setCopied(true)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`NexaFi Money Story for ${getMonthName(selectedMonth)}: Income ${formatINR(reportData.income)}, Expenses ${formatINR(reportData.expenses)}, Savings Rate ${reportData.savingsRate}%!`)
    }
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:p-0 print:max-w-full">
      {/* Selector and Actions block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            disabled={availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
            className="size-9 border-border/60 hover:bg-muted/40 cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="flex flex-col text-center sm:text-left min-w-[140px]">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Report Month</span>
            <span className="text-sm font-bold text-foreground">
              {getMonthName(selectedMonth)}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            disabled={availableMonths.indexOf(selectedMonth) === 0}
            className="size-9 border-border/60 hover:bg-muted/40 cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex gap-2.5 shrink-0 justify-end">
          <Button
            variant="outline"
            onClick={handleShare}
            className="h-9 font-semibold text-xs gap-1.5 border-border/60 hover:bg-muted/40 cursor-pointer"
          >
            <Share2 className="size-4 text-muted-foreground" />
            {copied ? 'Copied Link!' : 'Share Story'}
          </Button>

          <Button
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 font-semibold text-xs px-4 gap-1.5 shadow-md shadow-primary/10 cursor-pointer"
          >
            <Printer className="size-4" />
            Export PDF / Print
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
          <Activity className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Assembling your money story report...</p>
        </div>
      ) : !reportData.hasData ? (
        // Empty Onboarding State
        <Card className="border border-border/70 p-12 text-center py-24 bg-card/65 backdrop-blur-xs max-w-md mx-auto print:border-none print:shadow-none">
          <div className="size-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground mx-auto shadow-inner">
            <FileText className="size-7" />
          </div>
          <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">No data for {getMonthName(selectedMonth)}</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            There are no transactions logged in this calendar month. Add or import transactions, configure budgets, or record savings targets to generate your monthly money story booklet!
          </p>
        </Card>
      ) : (
        // Premium Money Story Report Booklet
        <div className="space-y-8 print:space-y-6">
          
          {/* F. money Story Summary Header */}
          <Card className="border border-primary/20 bg-primary/[0.02] p-6 shadow-md relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 size-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5 shadow-sm">
                <Bookmark className="size-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xs uppercase font-bold tracking-wider text-primary">Your Money Story Summary</h2>
                <p className="text-base sm:text-lg text-foreground font-semibold leading-relaxed">
                  “In {getMonthName(selectedMonth).split(' ')[0]}, you earned **{formatINR(reportData.income)}**, spent **{formatINR(reportData.expenses)}**, and saved **{formatINR(reportData.netCashflow)}**. Your biggest expense category was **{reportData.topCategories[0]?.label || 'discretionary'}** ({formatINR(reportData.topCategories[0]?.amount || 0)}). You stayed within **{reportData.budgetsAnalysis.length - reportData.overBudget.length} of {reportData.budgetsAnalysis.length} budgets**.”
                </p>
              </div>
            </div>
          </Card>

          {/* Grid Layout: Snapshot & Scorecard */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Section A: Monthly Snapshot Metric Cards */}
            <div className="md:col-span-2 grid gap-4 grid-cols-2">
              {/* Income */}
              <Card className="border border-border/80 bg-card/90 p-5 shadow-xs flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Monthly Income</span>
                <span className="tabnum text-2xl font-bold tracking-tight text-foreground block mt-2">
                  {formatINR(reportData.income)}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center mt-2">
                  <ArrowUpRight className="size-3.5 text-primary mr-0.5" />
                  Cash inflows
                </span>
              </Card>

              {/* Expenses */}
              <Card className="border border-border/80 bg-card/90 p-5 shadow-xs flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Monthly Expenses</span>
                <span className="tabnum text-2xl font-bold tracking-tight text-foreground block mt-2">
                  {formatINR(reportData.expenses)}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center mt-2">
                  <ArrowDownRight className="size-3.5 text-destructive mr-0.5" />
                  Cash outflows
                </span>
              </Card>

              {/* Net Cashflow */}
              <Card className="border border-border/80 bg-card/90 p-5 shadow-xs flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Net Savings</span>
                <span className={cn(
                  "tabnum text-2xl font-bold tracking-tight block mt-2",
                  reportData.netCashflow >= 0 ? "text-primary" : "text-destructive"
                )}>
                  {reportData.netCashflow >= 0 ? '+' : ''}{formatINR(reportData.netCashflow)}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-2">
                  Retained monthly flow
                </span>
              </Card>

              {/* Savings Rate */}
              <Card className="border border-border/80 bg-card/90 p-5 shadow-xs flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Savings Rate</span>
                <span className="tabnum text-2xl font-bold tracking-tight text-foreground block mt-2">
                  {reportData.savingsRate}%
                </span>
                <div className="w-full bg-muted rounded-full h-1 mt-2">
                  <div
                    className="bg-primary h-1 rounded-full"
                    style={{ width: `${Math.min(100, reportData.savingsRate)}%` }}
                  />
                </div>
              </Card>
            </div>

            {/* Health Scorecard card */}
            <Card className="border border-border/80 bg-card/95 p-6 shadow-md flex flex-col justify-between items-center text-center relative overflow-hidden">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Health Index</span>
              
              {/* Circular health score representation */}
              <div className="relative flex items-center justify-center size-28 my-3">
                <svg className="size-full rotate-[-90deg]">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    className="stroke-muted fill-transparent"
                    strokeWidth="8"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    className="stroke-primary fill-transparent transition-all duration-500"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={2 * Math.PI * 46 * (1 - reportData.healthScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">{reportData.healthScore}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Index</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-foreground">
                  {reportData.healthScore >= 80 ? 'Excellent Standing' : reportData.healthScore >= 60 ? 'Healthy standing' : 'Needs attention'}
                </span>
                <p className="text-[10px] text-muted-foreground leading-normal max-w-[180px] mx-auto">
                  Computed based on savings margin and budget limits control.
                </p>
              </div>
            </Card>
          </div>

          {/* Section B: Biggest Spending Areas */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Categories */}
            <Card className="border border-border/80 bg-card/90 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Coins className="size-4 text-primary" />
                Top Discretionary Categories
              </h3>
              
              <div className="space-y-3.5">
                {reportData.topCategories.map((c, idx) => {
                  const pct = reportData.expenses > 0 ? (c.amount / reportData.expenses) * 100 : 0
                  return (
                    <div key={c.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <span className="text-muted-foreground font-mono text-[10px]">{idx + 1}.</span>
                          {c.label}
                        </span>
                        <span className="font-bold text-foreground">{formatINR(c.amount)} ({Math.round(pct)}%)</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  )
                })}
                {reportData.topCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground py-4 text-center">No outflows logged.</p>
                )}
              </div>
            </Card>

            {/* Top Merchants & Single Largest Expense */}
            <Card className="border border-border/80 bg-card/90 p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Receipt className="size-4 text-primary" />
                  Top Outflow Merchants
                </h3>

                <div className="space-y-3">
                  {reportData.topMerchants.map((m, idx) => (
                    <div key={m.name} className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                      <span className="font-medium text-foreground flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono">{idx + 1}.</span>
                        {m.name}
                        <span className="text-[9px] text-muted-foreground font-semibold px-1 rounded bg-muted/65 leading-none">
                          {m.count}x
                        </span>
                      </span>
                      <span className="font-bold text-foreground">{formatINR(m.amount)}</span>
                    </div>
                  ))}
                  {reportData.topMerchants.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4 text-center">No merchant data available.</p>
                  )}
                </div>
              </div>

              {/* Largest single transaction */}
              {reportData.biggestExpense && (
                <div className="bg-muted/10 border border-border/40 rounded-lg p-3 mt-2 flex items-center justify-between gap-3 shrink-0">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground block">Largest Outflow Event</span>
                    <span className="text-xs font-bold text-foreground block truncate">{reportData.biggestExpense.merchant}</span>
                  </div>
                  <span className="text-xs font-bold text-destructive shrink-0 bg-destructive/10 border border-destructive/20 px-2.5 py-1 rounded-full">
                    {formatINR(reportData.biggestExpense.amount)}
                  </span>
                </div>
              )}
            </Card>
          </div>

          {/* Section C: Budget boundaries performance */}
          <Card className="border border-border/80 bg-card/90 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-3 gap-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Wallet className="size-4 text-primary" />
                Budget Containment Review
              </h3>
              
              <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-2 flex-wrap leading-none">
                <span>Safe to Spend remaining: <strong className="text-emerald-500 font-bold">{formatINR(reportData.remainingSafeToSpend)}</strong></span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Exceeded Card */}
              <div className="bg-destructive/[0.01] border border-destructive/20 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-destructive block">{reportData.overBudget.length}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mt-1">Exceeded Budgets</span>
                <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
                  {reportData.overBudget.length > 0
                    ? `Deficits: ${reportData.overBudget.map(b => b.label).join(', ')}`
                    : 'No spending limit breaches occurred.'}
                </p>
              </div>

              {/* Warning/Near Limit Card */}
              <div className="bg-amber-500/[0.01] border border-amber-500/25 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-amber-500 block">{reportData.nearLimit.length}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mt-1">Near Limit (&gt;=80%)</span>
                <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
                  {reportData.nearLimit.length > 0
                    ? `Warning caps: ${reportData.nearLimit.map(b => b.label).join(', ')}`
                    : 'All limits comfortably in green.'}
                </p>
              </div>

              {/* Within Budget Card */}
              <div className="bg-primary/[0.01] border border-primary/20 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-primary block">{reportData.withinBudget.length}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mt-1">Healthy Categories</span>
                <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
                  Spending categories fully under budget limits.
                </p>
              </div>
            </div>

            {/* List details of active budgets */}
            {reportData.budgetsAnalysis.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block px-1">Budget Tracker Metrics</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {reportData.budgetsAnalysis.map(b => (
                    <div key={b.category} className="border border-border/40 rounded-lg p-3 bg-muted/5 flex flex-col justify-between min-h-[76px]">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-foreground">{b.label}</span>
                        <span className={cn(
                          "font-bold",
                          b.ratio >= 1.0 ? "text-destructive" : b.ratio >= 0.8 ? "text-amber-500" : "text-foreground"
                        )}>
                          {formatINR(b.spent)} / {formatINR(b.limit)}
                        </span>
                      </div>
                      <div className="mt-2.5">
                        <Progress value={Math.min(100, b.ratio * 100)} className={cn(
                          "h-1.5",
                          b.ratio >= 1.0 ? "[&>div]:bg-destructive" : b.ratio >= 0.8 ? "[&>div]:bg-amber-500" : ""
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Section D: Goals Progress */}
          <Card className="border border-border/80 bg-card/90 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Target className="size-4 text-primary" />
                Goal Allocations & Savings
              </h3>
              <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 leading-none">
                <span>Total contributions this month: <strong className="text-primary font-bold">{formatINR(reportData.totalSavedThisMonth)}</strong></span>
              </div>
            </div>

            <div className="space-y-4">
              {goals.map(g => {
                const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0
                return (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground">{g.title}</span>
                      <span className="text-muted-foreground font-medium">
                        <strong className="text-foreground font-bold">{formatINR(g.current_amount)}</strong> of {formatINR(g.target_amount)} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                )
              })}
              {goals.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">No active goals found.</p>
              )}
            </div>
          </Card>

          {/* Section E: Recurring Payments */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Snapshot */}
            <div className="grid gap-4 grid-cols-1">
              <Card className="border border-border/80 bg-card/90 p-5 shadow-xs flex flex-col justify-between min-h-[105px]">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Expected Recurring Credit</span>
                <span className="tabnum text-2xl font-bold tracking-tight text-primary block mt-1">
                  +{formatINR(reportData.recurringIncome)}
                </span>
                <span className="text-[9px] text-muted-foreground mt-2 font-medium">
                  Auto-debit / credit flows
                </span>
              </Card>

              <Card className="border border-border/80 bg-card/90 p-5 shadow-xs flex flex-col justify-between min-h-[105px]">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Expected Recurring Outflow</span>
                <span className="tabnum text-2xl font-bold tracking-tight text-foreground block mt-1">
                  -{formatINR(reportData.recurringExpense)}
                </span>
                <span className="text-[9px] text-muted-foreground mt-2 font-medium">
                  Committed subscriptions / EMI
                </span>
              </Card>
            </div>

            {/* Upcoming items in next 30 days */}
            <Card className="md:col-span-2 border border-border/80 bg-card/90 p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  Expected Recurring Items (30 Days)
                </h3>

                <div className="grid gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {reportData.upcomingRecurring.slice(0, 3).map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs bg-muted/20 border border-border/30 rounded-lg p-2">
                      <span className="font-semibold text-foreground truncate max-w-[160px]">{item.merchant}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[9px] text-muted-foreground bg-muted border border-border/40 px-1.5 py-0.5 rounded leading-none">
                          {item.dueDate}
                        </span>
                        <span className="font-bold text-foreground">
                          {item.transaction_type === 'income' ? '+' : '-'}{formatINR(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {reportData.upcomingRecurring.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4 text-center">No upcoming recurring items expected.</p>
                  )}
                </div>
              </div>

              <div className="text-[9px] text-muted-foreground italic leading-none border-t border-border/30 pt-3 shrink-0">
                Matches confirmed local settings schedule.
              </div>
            </Card>
          </div>

        </div>
      )}
    </div>
  )
}
