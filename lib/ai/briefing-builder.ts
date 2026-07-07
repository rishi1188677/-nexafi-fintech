import { categories, type CategoryId } from '@/lib/data'
import { formatINR } from '@/lib/format'
import { detectRecurringPatterns, getUpcomingPayments } from '@/lib/recurring-helper'

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface BudgetRisk {
  category: string
  label: string
  limit: number
  spent: number
  ratio: number
}

export interface GoalProgress {
  id: string
  title: string
  pct: number
  current: number
  target: number
  monthly: number
}

export interface UpcomingBill {
  merchant: string
  amount: number
  dueDate: string
}

export interface BriefingFacts {
  currentMonth: string
  // Cashflow
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
  // Spending
  topCategory: string
  topCategoryAmount: number
  biggestMerchant: string
  biggestMerchantAmount: number
  // Trends
  prevMonthExpenses: number
  expenseChange: number
  expenseChangePct: number
  trendingUpCategories: string[]
  // Budgets
  overBudgets: BudgetRisk[]
  nearBudgets: BudgetRisk[]
  safeToSpend: number
  // Goals
  goals: GoalProgress[]
  // Recurring / bills
  upcomingBills: UpcomingBill[]
  recurringMonthlyExpense: number
  // Tools used
  toolsUsed: string[]
}

// ──────────────────────────────────────────────────────────────────────────────
// Core builder — pure deterministic maths, no Gemini
// ──────────────────────────────────────────────────────────────────────────────

export function buildBriefingFacts(
  transactions: any[],
  budgets: any[],
  goals: any[],
  recurringPrefs: any = {},
): BriefingFacts {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

  const toolsUsed: string[] = []

  // ── 1. Cashflow ──────────────────────────────────────────────────────────────
  toolsUsed.push('Cashflow Tool')
  const curMonthTxs = transactions.filter(t => t.transaction_date.slice(0, 7) === currentMonth)
  const incomeTxs = curMonthTxs.filter(t => t.transaction_type === 'income')
  const expenseTxs = curMonthTxs.filter(t => t.transaction_type === 'expense')

  const totalIncome = incomeTxs.reduce((s, t) => s + Math.abs(t.amount), 0)
  const totalExpenses = expenseTxs.reduce((s, t) => s + Math.abs(t.amount), 0)
  const netSavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0

  // ── 2. Top category & merchant ───────────────────────────────────────────────
  toolsUsed.push('Spending Analysis Tool')
  const categoryTotals: Record<string, number> = {}
  expenseTxs.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount)
  })
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])
  const topCategory = sortedCategories[0]
    ? (categories[sortedCategories[0][0] as CategoryId]?.label ?? sortedCategories[0][0])
    : 'None'
  const topCategoryAmount = sortedCategories[0]?.[1] ?? 0

  const merchantTotals: Record<string, number> = {}
  expenseTxs.forEach(t => {
    merchantTotals[t.merchant] = (merchantTotals[t.merchant] || 0) + Math.abs(t.amount)
  })
  const sortedMerchants = Object.entries(merchantTotals).sort((a, b) => b[1] - a[1])
  const biggestMerchant = sortedMerchants[0]?.[0] ?? 'None'
  const biggestMerchantAmount = sortedMerchants[0]?.[1] ?? 0

  // ── 3. Trend vs previous month ───────────────────────────────────────────────
  toolsUsed.push('Trend Tool')
  const prevExpenseTxs = transactions.filter(
    t => t.transaction_date.slice(0, 7) === prevMonth && t.transaction_type === 'expense'
  )
  const prevMonthExpenses = prevExpenseTxs.reduce((s, t) => s + Math.abs(t.amount), 0)
  const expenseChange = totalExpenses - prevMonthExpenses
  const expenseChangePct =
    prevMonthExpenses > 0 ? Math.round((expenseChange / prevMonthExpenses) * 100) : 0

  const prevCatTotals: Record<string, number> = {}
  prevExpenseTxs.forEach(t => {
    prevCatTotals[t.category] = (prevCatTotals[t.category] || 0) + Math.abs(t.amount)
  })
  const trendingUpCategories: string[] = []
  Object.entries(categoryTotals).forEach(([cat, cur]) => {
    const prev = prevCatTotals[cat] ?? 0
    if (cur > prev * 1.2 && cur - prev > 500) {
      trendingUpCategories.push(categories[cat as CategoryId]?.label ?? cat)
    }
  })

  // ── 4. Budget risk ───────────────────────────────────────────────────────────
  toolsUsed.push('Budget Tool')
  const activeBudgets = budgets.filter(b => b.month.slice(0, 7) === currentMonth)
  const budgetAnalysis = activeBudgets.map(b => {
    const spent = expenseTxs
      .filter(t => t.category === b.category)
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    return {
      category: b.category,
      label: categories[b.category as CategoryId]?.label ?? b.category,
      limit: b.budget_amount,
      spent,
      ratio: b.budget_amount > 0 ? spent / b.budget_amount : 0,
    }
  })
  const overBudgets = budgetAnalysis.filter(b => b.ratio >= 1.0)
  const nearBudgets = budgetAnalysis.filter(b => b.ratio >= 0.8 && b.ratio < 1.0)
  const totalBudgetLimit = activeBudgets.reduce((s, b) => s + b.budget_amount, 0)
  const totalBudgetSpent = budgetAnalysis.reduce((s, b) => s + b.spent, 0)
  const safeToSpend = Math.max(0, totalBudgetLimit - totalBudgetSpent)

  // ── 5. Goals ─────────────────────────────────────────────────────────────────
  toolsUsed.push('Goal Tracking Tool')
  const goalsProgress: GoalProgress[] = goals
    .filter(g => g.current_amount < g.target_amount)
    .map(g => ({
      id: g.id,
      title: g.title,
      pct: g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0,
      current: g.current_amount,
      target: g.target_amount,
      monthly: g.monthly_contribution,
    }))

  // ── 6. Recurring & upcoming bills ────────────────────────────────────────────
  toolsUsed.push('Recurring Tool')
  let upcomingBills: UpcomingBill[] = []
  let recurringMonthlyExpense = 0
  try {
    const detected = detectRecurringPatterns(transactions, recurringPrefs)
    const upcoming = getUpcomingPayments(detected, 30)
    upcomingBills = upcoming.slice(0, 5).map(u => ({
      merchant: u.merchant,
      amount: u.amount,
      dueDate: u.dueDate,
    }))
    recurringMonthlyExpense = detected
      .filter(item => item.transaction_type === 'expense' && item.status === 'active')
      .reduce((s, item) => s + item.amount, 0)
  } catch {
    // Recurring detection is best-effort — don't fail the whole briefing
  }

  return {
    currentMonth,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    topCategory,
    topCategoryAmount,
    biggestMerchant,
    biggestMerchantAmount,
    prevMonthExpenses,
    expenseChange,
    expenseChangePct,
    trendingUpCategories,
    overBudgets,
    nearBudgets,
    safeToSpend,
    goals: goalsProgress,
    upcomingBills,
    recurringMonthlyExpense,
    toolsUsed,
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Compact context formatter — sent to Gemini (no raw tx history)
// ──────────────────────────────────────────────────────────────────────────────

export function formatBriefingContext(f: BriefingFacts): string {
  const budgetWarnings =
    [
      ...f.overBudgets.map(
        b => `  - ${b.label}: EXCEEDED by ${formatINR(b.spent - b.limit)}`
      ),
      ...f.nearBudgets.map(
        b => `  - ${b.label}: ${Math.round(b.ratio * 100)}% used (${formatINR(b.spent)} / ${formatINR(b.limit)})`
      ),
    ].join('\n') || '  All budgets on track.'

  const goalsText =
    f.goals
      .map(
        g =>
          `  - ${g.title}: ${g.pct}% (${formatINR(g.current)} / ${formatINR(g.target)}), contributing ${formatINR(g.monthly)}/month`
      )
      .join('\n') || '  No active goals.'

  const billsText =
    f.upcomingBills
      .map(b => `  - ${b.merchant}: ${formatINR(b.amount)} due ${b.dueDate}`)
      .join('\n') || '  No upcoming bills detected.'

  const trendLine =
    f.prevMonthExpenses > 0
      ? `${f.expenseChange >= 0 ? '+' : ''}${formatINR(f.expenseChange)} vs last month (${f.expenseChangePct >= 0 ? '+' : ''}${f.expenseChangePct}%)`
      : 'No prior month data available.'

  const trendingText =
    f.trendingUpCategories.length > 0
      ? f.trendingUpCategories.join(', ')
      : 'None'

  return `DETERMINISTIC BRIEFING FACTS (calculated from real user data):
Month: ${f.currentMonth}

CASHFLOW:
  Income:    ${formatINR(f.totalIncome)}
  Expenses:  ${formatINR(f.totalExpenses)}
  Net saved: ${formatINR(f.netSavings)}
  Savings rate: ${f.savingsRate}%

SPENDING:
  Top category: ${f.topCategory} — ${formatINR(f.topCategoryAmount)}
  Biggest merchant: ${f.biggestMerchant} — ${formatINR(f.biggestMerchantAmount)}
  Expense trend vs last month: ${trendLine}
  Spending increases vs last month: ${trendingText}

BUDGET STATUS:
  Over-limit budgets: ${f.overBudgets.length}
  Near-limit budgets (≥80%): ${f.nearBudgets.length}
${budgetWarnings}
  Safe-to-spend remaining: ${formatINR(f.safeToSpend)}

GOALS (active, incomplete):
${goalsText}

UPCOMING BILLS (next 30 days):
${billsText}
  Recurring monthly commitments: ${formatINR(f.recurringMonthlyExpense)}`
}
